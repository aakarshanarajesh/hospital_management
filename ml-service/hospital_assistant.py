"""
Hospital Assistant - Natural language interface for hospital data
Supports both OpenAI and mock LLM modes
"""

import os
from dotenv import load_dotenv
import logging
from pymongo import MongoClient
from datetime import datetime

load_dotenv()

logger = logging.getLogger(__name__)

class HospitalAssistant:
    """Natural language interface for hospital data"""
    
    def __init__(self):
        """Initialize the assistant"""
        self.mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/hospital_management')
        self.mongodb_db_name = os.getenv('MONGODB_DB_NAME', 'hospital_management')
        self.assistant_type = os.getenv('ASSISTANT_TYPE', 'mock')
        self.openai_key = os.getenv('OPENAI_API_KEY')
        
        # Initialize MongoDB connection
        self.mongo_client = None
        self.db = None
        self.connect_to_db()
        
        # Initialize LLM
        self.llm = self.initialize_llm()
    
    def connect_to_db(self):
        """Connect to MongoDB"""
        try:
            self.mongo_client = MongoClient(self.mongodb_uri)
            self.db = self.mongo_client[self.mongodb_db_name]
            logger.info("Connected to MongoDB")
        except Exception as e:
            logger.warning(f"MongoDB connection failed: {e}")
            logger.info("   Using mock data instead")
    
    def initialize_llm(self):
        """Initialize LLM based on configuration"""
        if self.assistant_type == 'openai' and self.openai_key:
            try:
                from openai import OpenAI
                self.openai_client = OpenAI(api_key=self.openai_key)
                logger.info("OpenAI LLM initialized")
                return 'openai'
            except Exception as e:
                logger.warning(f"OpenAI initialization failed: {e}")
        
        logger.info("Mock LLM initialized (for testing)")
        return 'mock'
    
    def get_hospital_stats(self):
        """Fetch real-time hospital statistics from MongoDB"""
        stats = {
            'icu_beds_available': 0,
            'general_beds_available': 0,
            'private_beds_available': 0,
            'total_patients': 0,
            'high_risk_patients': 0,
            'oxygen_cylinders_available': 0,
            'ventilators_available': 0,
            'beds_occupied': 0,
            'timestamp': datetime.now().isoformat()
        }
        
        if self.db is None:
            logger.warning("No database connection - returning mock stats")
            return self._get_mock_stats()
        
        try:
            logger.info("Fetching hospital stats from MongoDB...")
            
            # Get resource statistics from Resource collection (primary source for ICU beds)
            try:
                resources = list(self.db['resources'].find({}))
                logger.info(f"Found {len(resources)} resources in database")
                for resource in resources:
                    resource_name = resource.get('resourceName')
                    available_quantity = resource.get('availableQuantity', 0)
                    logger.info(f"Resource: {resource_name} = {available_quantity}")
                    
                    if resource_name == 'ICU_Beds':
                        stats['icu_beds_available'] = available_quantity
                    elif resource_name == 'Oxygen_Cylinders':
                        stats['oxygen_cylinders_available'] = available_quantity
                    elif resource_name == 'Ventilators':
                        stats['ventilators_available'] = available_quantity
            except Exception as e:
                logger.error(f"Error fetching resources: {e}")
                pass
            
            # Get patient statistics
            try:
                stats['total_patients'] = self.db['patients'].count_documents({'status': 'admitted'})
                stats['high_risk_patients'] = self.db['patients'].count_documents({
                    'riskPrediction.riskLevel': 2,
                    'status': 'admitted'
                })
                stats['beds_occupied'] = self.db['beds'].count_documents({'status': 'occupied'})
            except Exception as e:
                logger.error(f"Error fetching patient stats: {e}")
                pass
            
            # Get bed statistics
            try:
                bed_stats = list(self.db['beds'].aggregate([
                    {'$group': {
                        '_id': '$wardType',
                        'total': {'$sum': 1},
                        'occupied': {'$sum': {'$cond': [{'$eq': ['$status', 'occupied']}, 1, 0]}}
                    }}
                ]))
                logger.info(f"Bed stats: {bed_stats}")
                
                for stat in bed_stats:
                    ward_type = stat['_id']
                    available = stat['total'] - stat['occupied']
                    
                    if ward_type == 'ICU':
                        # Only use beds collection if resources collection didn't have ICU_Beds
                        if stats['icu_beds_available'] == 0:
                            stats['icu_beds_available'] = available
                    elif ward_type == 'General':
                        stats['general_beds_available'] = available
                    elif ward_type == 'Private':
                        stats['private_beds_available'] = available
            except Exception as e:
                logger.error(f"Error fetching bed stats: {e}")
                pass
            
            logger.info(f"Final stats: {stats}")
            return stats
            
        except Exception as e:
            logger.error(f"Error fetching stats: {e}")
            logger.warning("Falling back to mock stats")
            return self._get_mock_stats()
    
    def _get_mock_stats(self):
        """Return mock hospital statistics for testing"""
        return {
            'icu_beds_available': 7,
            'general_beds_available': 4,
            'private_beds_available': 2,
            'total_patients': 6,
            'high_risk_patients': 1,
            'oxygen_cylinders_available': 35,
            'ventilators_available': 12,
            'beds_occupied': 5,
            'timestamp': datetime.now().isoformat()
        }
    
    def build_context_prompt(self, stats):
        """Build the context prompt for LLM"""
        return f"""You are a hospital management assistant. Answer questions based ONLY on this current hospital data.

HOSPITAL STATISTICS (Current):
- ICU Beds Available: {stats['icu_beds_available']}
- General Beds Available: {stats['general_beds_available']}
- Private Beds Available: {stats['private_beds_available']}
- Total Beds Occupied: {stats['beds_occupied']}
- Total Patients (Admitted): {stats['total_patients']}
- High Risk Patients: {stats['high_risk_patients']}
- Oxygen Cylinders Available: {stats['oxygen_cylinders_available']}
- Ventilators Available: {stats['ventilators_available']}
- Last Updated: {stats['timestamp']}

Instructions:
1. Only use the data provided above
2. Give short, clear, factual answers (2-3 sentences)
3. If asked about data not in the statistics, say "I don't have that information"
4. Be helpful and professional
5. Use appropriate medical terminology

Answer the following question based ONLY on the hospital data above:"""
    
    def answer_with_openai(self, question, context_prompt):
        """Use OpenAI to answer the question"""
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": context_prompt},
                    {"role": "user", "content": question}
                ],
                temperature=0.5,
                max_tokens=150
            )
            
            answer = response.choices[0].message.content
            return answer, 0.95
        
        except Exception as e:
            logger.error(f"OpenAI error: {e}")
            return None, 0.0
    
    def answer_with_mock_llm(self, question, stats):
        """Use mock LLM for demonstration"""
        question_lower = question.lower()

        def format_count(count, singular, plural=None):
            label = singular if count == 1 else (plural or f"{singular}s")
            return f"{count} {label}"
        
        # Simple keyword-based responses
        if any(word in question_lower for word in ['icu', 'bed']):
            return f"Currently, we have {format_count(stats['icu_beds_available'], 'ICU bed')} available.", 0.85

        if any(word in question_lower for word in ['high risk', 'risk patient']):
            verb = 'is' if stats['high_risk_patients'] == 1 else 'are'
            return f"There {verb} {format_count(stats['high_risk_patients'], 'high-risk patient')} currently in the hospital.", 0.85
        
        if any(word in question_lower for word in ['patient', 'admitted']):
            return f"We currently have {format_count(stats['total_patients'], 'admitted patient')}.", 0.85
        
        if any(word in question_lower for word in ['oxygen', 'supply']):
            return f"Oxygen cylinder supply: {format_count(stats['oxygen_cylinders_available'], 'cylinder')} available.", 0.85
        
        if any(word in question_lower for word in ['ventilator']):
            return f"We have {format_count(stats['ventilators_available'], 'ventilator')} available.", 0.85
        
        if any(word in question_lower for word in ['occupied', 'occupancy']):
            verb = 'is' if stats['beds_occupied'] == 1 else 'are'
            return f"Currently {format_count(stats['beds_occupied'], 'bed')} {verb} occupied.", 0.85
        
        if any(word in question_lower for word in ['available', 'bed']):
            total_available = (stats['icu_beds_available'] + 
                             stats['general_beds_available'] + 
                             stats['private_beds_available'])
            return f"We have {total_available} beds available across all wards.", 0.85
        
        # Default response
        return "I can help with information about beds, patients, resources, and hospital occupancy. Please ask a more specific question.", 0.6
    
    def answer_question(self, question):
        """Answer a question about hospital data"""
        if not question or not question.strip():
            return {
                'question': question,
                'answer': 'Please ask a valid question.',
                'confidence': 0.0,
                'error': 'Empty question'
            }
        
        # Get hospital statistics
        stats = self.get_hospital_stats()
        
        # Build context
        context_prompt = self.build_context_prompt(stats)
        
        # Get answer
        if self.llm == 'openai':
            answer, confidence = self.answer_with_openai(question, context_prompt)
        else:
            answer, confidence = self.answer_with_mock_llm(question, stats)
        
        if answer is None:
            answer = "I encountered an error processing your question. Please try again."
            confidence = 0.0
        
        return {
            'question': question,
            'answer': answer,
            'confidence': confidence,
            'stats': stats
        }
    
    def get_health_status(self):
        """Get health/status of the assistant"""
        return {
            'status': 'ok',
            'llm_type': self.llm,
            'database_connected': self.db is not None,
            'openai_configured': bool(self.openai_key)
        }
