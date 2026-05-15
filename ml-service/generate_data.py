"""
Generate synthetic patient health data for training ML model
"""

import pandas as pd
import numpy as np
import json
from pathlib import Path

# Set random seed for reproducibility
np.random.seed(42)

def generate_synthetic_data(n_samples=500):
    """
    Generate synthetic patient health data
    
    Features:
    - age: 18-85
    - heart_rate: 40-120 bpm
    - systolic_bp: 80-200 mmHg
    - diastolic_bp: 40-120 mmHg
    - spo2: 88-100 %
    - fever: 0-1 (has fever or not)
    - cough: 0-1 (has cough or not)
    - breathing_difficulty: 0-1 (has breathing difficulty or not)
    - risk_level: Low (0), Medium (1), High (2)
    """
    
    data = {
        'age': np.random.randint(18, 85, n_samples),
        'heart_rate': np.random.normal(80, 15, n_samples).clip(40, 150).astype(int),
        'systolic_bp': np.random.normal(120, 20, n_samples).clip(80, 200).astype(int),
        'diastolic_bp': np.random.normal(75, 12, n_samples).clip(40, 120).astype(int),
        'spo2': np.random.normal(96, 2, n_samples).clip(88, 100).astype(int),
        'fever': np.random.choice([0, 1], n_samples),
        'cough': np.random.choice([0, 1], n_samples),
        'breathing_difficulty': np.random.choice([0, 1], n_samples),
    }
    
    df = pd.DataFrame(data)
    
    # Create risk level based on health data
    risk_scores = pd.Series([0] * n_samples, dtype=float)
    
    # Age factor
    risk_scores += (df['age'] > 60) * 0.3
    risk_scores += (df['age'] > 75) * 0.3
    
    # Heart rate factor
    risk_scores += ((df['heart_rate'] < 50) | (df['heart_rate'] > 110)) * 0.3
    risk_scores += ((df['heart_rate'] < 40) | (df['heart_rate'] > 120)) * 0.3
    
    # Blood pressure factor
    risk_scores += ((df['systolic_bp'] > 160) | (df['diastolic_bp'] > 100)) * 0.4
    risk_scores += ((df['systolic_bp'] > 180) | (df['diastolic_bp'] > 120)) * 0.3
    
    # Oxygen level factor
    risk_scores += (df['spo2'] < 92) * 0.5
    risk_scores += (df['spo2'] < 88) * 0.5
    
    # Symptoms factor
    risk_scores += (df['fever'] == 1) * 0.2
    risk_scores += (df['cough'] == 1) * 0.2
    risk_scores += (df['breathing_difficulty'] == 1) * 0.4
    
    # Multiple symptoms boost risk
    symptom_count = df['fever'] + df['cough'] + df['breathing_difficulty']
    risk_scores += (symptom_count > 1) * 0.3
    
    # Classify risk level
    df['risk_level'] = pd.cut(
        risk_scores,
        bins=[0, 0.9, 1.5, np.inf],
        labels=[0, 1, 2],  # 0: Low, 1: Medium, 2: High
        include_lowest=True
    ).astype(int)
    
    return df

def save_data(df, filename='training_data.csv'):
    """Save data to CSV"""
    data_dir = Path(__file__).parent / 'data'
    data_dir.mkdir(exist_ok=True)
    filepath = data_dir / filename
    df.to_csv(filepath, index=False)
    print(f"Saved training data to {filepath}")
    print(f"   Total samples: {len(df)}")
    print(f"   Features: {list(df.columns)}")
    print(f"\n   Risk distribution:")
    print(f"   Low (0): {(df['risk_level'] == 0).sum()}")
    print(f"   Medium (1): {(df['risk_level'] == 1).sum()}")
    print(f"   High (2): {(df['risk_level'] == 2).sum()}")
    return filepath

def create_sample_json(filepath):
    """Create sample JSON format for API requests"""
    df = pd.read_csv(filepath)
    
    # Sample from each risk level
    samples = []
    for risk_level in [0, 1, 2]:
        sample_row = df[df['risk_level'] == risk_level].iloc[0]
        samples.append({
            'age': int(sample_row['age']),
            'heart_rate': int(sample_row['heart_rate']),
            'systolic_bp': int(sample_row['systolic_bp']),
            'diastolic_bp': int(sample_row['diastolic_bp']),
            'spo2': int(sample_row['spo2']),
            'fever': int(sample_row['fever']),
            'cough': int(sample_row['cough']),
            'breathing_difficulty': int(sample_row['breathing_difficulty']),
        })
    
    sample_file = Path(__file__).parent / 'data' / 'sample_predictions.json'
    with open(sample_file, 'w') as f:
        json.dump(samples, f, indent=2)
    
    print(f"\nSaved sample predictions to {sample_file}")

if __name__ == '__main__':
    print("Generating synthetic patient health data...")
    print()
    
    # Generate data
    df = generate_synthetic_data(n_samples=500)
    
    # Save data
    filepath = save_data(df)
    
    # Create sample JSON
    create_sample_json(filepath)
    
    print("\nData generation complete!")
