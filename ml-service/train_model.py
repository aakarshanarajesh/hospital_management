"""
Train ML model for patient risk prediction
Uses Logistic Regression and Random Forest
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    classification_report, 
    confusion_matrix, 
    accuracy_score,
    precision_score,
    recall_score,
    f1_score
)
import joblib
from pathlib import Path

class PatientRiskPredictor:
    """ML model for predicting patient risk levels"""
    
    def __init__(self, model_type='random_forest'):
        """
        Initialize predictor
        
        Args:
            model_type: 'logistic_regression' or 'random_forest'
        """
        self.model_type = model_type
        self.model = None
        self.scaler = StandardScaler()
        self.feature_names = [
            'age', 'heart_rate', 'systolic_bp', 
            'diastolic_bp', 'spo2', 'fever', 'cough', 'breathing_difficulty'
        ]
        self.risk_labels = {0: 'Low', 1: 'Medium', 2: 'High'}
    
    def load_data(self, filepath):
        """Load training data"""
        df = pd.read_csv(filepath)
        print(f"Loaded {len(df)} samples from {filepath}")
        return df
    
    def prepare_data(self, df):
        """Prepare features and labels"""
        X = df[self.feature_names]
        y = df['risk_level']
        
        print(f"\nData Summary:")
        print(f"   Features: {len(X.columns)}")
        print(f"   Samples: {len(X)}")
        print(f"   Risk distribution:")
        print(f"   - Low: {(y == 0).sum()}")
        print(f"   - Medium: {(y == 1).sum()}")
        print(f"   - High: {(y == 2).sum()}")
        
        return X, y
    
    def train(self, X, y, test_size=0.2, random_state=42):
        """Train the model"""
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state, stratify=y
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        print(f"\nTraining {self.model_type}...")
        
        # Train model
        if self.model_type == 'logistic_regression':
            self.model = LogisticRegression(max_iter=1000, random_state=random_state)
        else:  # random_forest
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=random_state,
                n_jobs=-1
            )
        
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test_scaled)
        
        print(f"\nModel Performance:")
        print(f"   Accuracy: {accuracy_score(y_test, y_pred):.4f}")
        print(f"   Precision: {precision_score(y_test, y_pred, average='weighted'):.4f}")
        print(f"   Recall: {recall_score(y_test, y_pred, average='weighted'):.4f}")
        print(f"   F1-Score: {f1_score(y_test, y_pred, average='weighted'):.4f}")
        
        print(f"\nClassification Report:")
        print(classification_report(y_test, y_pred, target_names=['Low', 'Medium', 'High']))
        
        # Cross-validation
        cv_scores = cross_val_score(self.model, X_train_scaled, y_train, cv=5)
        print(f"\nCross-Validation Scores: {cv_scores}")
        print(f"   Mean: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
        
        return self.model, self.scaler
    
    def predict(self, features_dict):
        """
        Predict risk for a single patient
        
        Args:
            features_dict: Dict with keys matching self.feature_names
        
        Returns:
            Dict with risk_level and probability
        """
        if self.model is None:
            raise ValueError("Model not trained yet")
        
        # Create feature array
        features = pd.DataFrame(
            [[features_dict[name] for name in self.feature_names]],
            columns=self.feature_names
        )
        features_scaled = self.scaler.transform(features)
        
        # Predict
        prediction = self.model.predict(features_scaled)[0]
        probabilities = self.model.predict_proba(features_scaled)[0]
        confidence = max(probabilities)
        
        return {
            'risk_level': int(prediction),
            'risk_label': self.risk_labels[int(prediction)],
            'probability': float(confidence),
            'probabilities': {
                'low': float(probabilities[0]),
                'medium': float(probabilities[1]) if len(probabilities) > 1 else 0.0,
                'high': float(probabilities[2]) if len(probabilities) > 2 else 0.0,
            }
        }
    
    def save_model(self, model_dir='models'):
        """Save model and scaler"""
        model_path = Path(__file__).parent / model_dir
        model_path.mkdir(exist_ok=True)
        
        model_file = model_path / f'patient_risk_model_{self.model_type}.pkl'
        scaler_file = model_path / 'scaler.pkl'
        
        joblib.dump(self.model, model_file)
        joblib.dump(self.scaler, scaler_file)
        
        print(f"\nModel saved to {model_file}")
        print(f"Scaler saved to {scaler_file}")
        
        return model_file, scaler_file
    
    @classmethod
    def load_model(cls, model_dir='models', model_type='random_forest'):
        """Load trained model and scaler"""
        model_path = Path(__file__).parent / model_dir
        
        model_file = model_path / f'patient_risk_model_{model_type}.pkl'
        scaler_file = model_path / 'scaler.pkl'
        
        if not model_file.exists() or not scaler_file.exists():
            raise FileNotFoundError(f"Model files not found in {model_path}")
        
        predictor = cls(model_type=model_type)
        predictor.model = joblib.load(model_file)
        predictor.scaler = joblib.load(scaler_file)
        
        print(f"Loaded model from {model_file}")
        print(f"Loaded scaler from {scaler_file}")
        
        return predictor

def main():
    """Train and save models"""
    import sys
    
    # Default: train random forest
    model_type = sys.argv[1] if len(sys.argv) > 1 else 'random_forest'
    
    # Load data
    data_file = Path(__file__).parent / 'data' / 'training_data.csv'
    
    if not data_file.exists():
        print("Training data not found!")
        print("   Run: python generate_data.py")
        sys.exit(1)
    
    # Initialize predictor
    predictor = PatientRiskPredictor(model_type=model_type)
    
    # Load and prepare data
    df = predictor.load_data(data_file)
    X, y = predictor.prepare_data(df)
    
    # Train model
    predictor.train(X, y)
    
    # Save model
    predictor.save_model()
    
    # Test prediction
    print(f"\nTesting prediction...")
    sample_patient = {
        'age': 65,
        'heart_rate': 105,
        'systolic_bp': 160,
        'diastolic_bp': 95,
        'spo2': 89,
        'fever': 1,
        'cough': 1,
        'breathing_difficulty': 1,
    }
    
    result = predictor.predict(sample_patient)
    print(f"\n   Patient: {sample_patient}")
    print(f"   Prediction: {result['risk_label']} (confidence: {result['probability']:.2%})")
    
    print(f"\nTraining complete!")

if __name__ == '__main__':
    main()
