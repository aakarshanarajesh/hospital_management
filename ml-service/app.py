"""
Flask ML Service
- Risk prediction API
- Hospital assistant API
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from train_model import PatientRiskPredictor
from hospital_assistant import HospitalAssistant
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global instances
risk_predictor = None
hospital_assistant = None

@app.before_request
def initialize_models():
    """Initialize models on first request"""
    global risk_predictor, hospital_assistant
    
    if risk_predictor is None:
        try:
            risk_predictor = PatientRiskPredictor.load_model(model_type='random_forest')
            logger.info("Risk predictor loaded")
        except Exception as e:
            logger.error(f"Failed to load risk predictor: {e}")
    
    if hospital_assistant is None:
        try:
            hospital_assistant = HospitalAssistant()
            logger.info("Hospital assistant initialized")
        except Exception as e:
            logger.error(f"Failed to initialize hospital assistant: {e}")

@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'service': 'Hospital ML Service',
        'version': '1.0.0'
    }), 200

@app.route('/api/predict-risk', methods=['POST'])
@app.route('/predict-risk', methods=['POST'])
def predict_risk():
    """
    Predict patient risk level
    
    Request body:
    {
        "age": 65,
        "heart_rate": 105,
        "systolic_bp": 160,
        "diastolic_bp": 95,
        "spo2": 89,
        "fever": 1,
        "cough": 1,
        "breathing_difficulty": 1
    }
    
    Response:
    {
        "risk_level": 2,
        "risk_label": "High",
        "probability": 0.92,
        "probabilities": {
            "low": 0.05,
            "medium": 0.03,
            "high": 0.92
        }
    }
    """
    try:
        if risk_predictor is None:
            return jsonify({'error': 'Model not loaded'}), 500
        
        data = request.get_json()
        
        symptoms = data.get('symptoms', [])
        normalized_symptoms = [str(symptom).lower() for symptom in symptoms]
        if 'bp' in data and 'systolic_bp' not in data:
            data['systolic_bp'] = data['bp']
        if 'diastolic_bp' not in data:
            data['diastolic_bp'] = data.get('systolic_bp', 120) - 40
        if 'fever' not in data:
            data['fever'] = int('fever' in normalized_symptoms)
        if 'cough' not in data:
            data['cough'] = int('cough' in normalized_symptoms)
        if 'breathing_difficulty' not in data:
            data['breathing_difficulty'] = int(
                'breathing difficulty' in normalized_symptoms
                or 'breathing_difficulty' in normalized_symptoms
            )

        # Validate required fields
        required_fields = ['age', 'heart_rate', 'systolic_bp', 'diastolic_bp', 
                          'spo2', 'fever', 'cough', 'breathing_difficulty']
        
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing field: {field}'}), 400
        
        # Validate value ranges
        if not (18 <= data['age'] <= 120):
            return jsonify({'error': 'Age must be between 18 and 120'}), 400
        
        if not (30 <= data['heart_rate'] <= 200):
            return jsonify({'error': 'Heart rate must be between 30 and 200'}), 400
        
        if not (80 <= data['systolic_bp'] <= 220):
            return jsonify({'error': 'Systolic BP must be between 80 and 220'}), 400
        
        if not (50 <= data['spo2'] <= 100):
            return jsonify({'error': 'SpO2 must be between 50 and 100'}), 400
        
        # Predict
        prediction = risk_predictor.predict(data)
        
        logger.info(f"Risk prediction: {prediction['risk_label']}")
        
        return jsonify({
            **prediction,
            'risk': prediction['risk_label'],
            'confidence': prediction['probability'],
        }), 200
    
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ask-assistant', methods=['POST'])
def ask_assistant():
    """
    Hospital assistant API
    
    Request body:
    {
        "question": "How many ICU beds are available?"
    }
    
    Response:
    {
        "question": "How many ICU beds are available?",
        "answer": "Currently, 2 ICU beds are available.",
        "confidence": 0.95
    }
    """
    try:
        if hospital_assistant is None:
            return jsonify({'error': 'Assistant not initialized'}), 500
        
        data = request.get_json()
        
        if 'question' not in data:
            return jsonify({'error': 'Missing field: question'}), 400
        
        question = data['question']
        
        # Get response
        response = hospital_assistant.answer_question(question)
        
        logger.info(f"Assistant question: {question}")
        
        return jsonify(response), 200
    
    except Exception as e:
        logger.error(f"Assistant error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/hospital-stats', methods=['GET'])
def get_hospital_stats():
    """Get current hospital statistics for assistant context"""
    try:
        if hospital_assistant is None:
            return jsonify({'error': 'Assistant not initialized'}), 500
        
        stats = hospital_assistant.get_hospital_stats()
        print(f"DEBUG: Hospital stats returned: {stats}")
        
        return jsonify(stats), 200
    
    except Exception as e:
        logger.error(f"Stats error: {e}")
        print(f"DEBUG: Stats error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/debug/db-check', methods=['GET'])
def debug_db_check():
    """Debug endpoint to check database connection"""
    try:
        from pymongo import MongoClient
        
        mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/hospital_management')
        client = MongoClient(mongodb_uri, ssl=True, serverSelectionTimeoutMS=5000)
        db = client['hospital_management']
        
        # Ping to check connection
        client.admin.command('ping')
        
        # Get resources
        resources = list(db['resources'].find({}))
        
        return jsonify({
            'status': 'connected',
            'resources_count': len(resources),
            'resources': [{
                'name': r.get('resourceName'),
                'available': r.get('availableQuantity'),
                'total': r.get('totalQuantity')
            } for r in resources]
        }), 200
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500

@app.route('/api/model-info', methods=['GET'])
def get_model_info():
    """Get information about the loaded model"""
    try:
        return jsonify({
            'model_type': 'Random Forest',
            'model_file': 'patient_risk_model_random_forest.pkl',
            'features': [
                'age', 'heart_rate', 'systolic_bp', 'diastolic_bp',
                'spo2', 'fever', 'cough', 'breathing_difficulty'
            ],
            'risk_levels': ['Low', 'Medium', 'High'],
            'status': 'loaded' if risk_predictor else 'not_loaded'
        }), 200
    
    except Exception as e:
        logger.error(f"Model info error: {e}")
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == "__main__":
    port = int(os.getenv('FLASK_PORT', 5001))
    app.run(host="0.0.0.0", port=port)
