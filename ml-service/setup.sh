#!/bin/bash

# ML Service Setup - Mac/Linux
# Installs Python dependencies and trains model

echo ""
echo "🤖 Hospital ML Service Setup"
echo "============================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python 3.9 or higher."
    echo "   Visit: https://www.python.org/downloads/"
    exit 1
fi

PYTHON_VERSION=$(python3 --version)
echo "✅ $PYTHON_VERSION"
echo ""

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

echo "✅ Virtual environment activated"
echo ""

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

echo "✅ Dependencies installed"
echo ""

# Generate synthetic data
echo "🔄 Generating synthetic training data..."
python3 generate_data.py

echo "✅ Data generated"
echo ""

# Train model
echo "🔄 Training ML model..."
python3 train_model.py

echo "✅ Model trained"
echo ""

# Final instructions
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Start the ML Service:"
echo "   source venv/bin/activate"
echo "   python3 app.py"
echo ""
echo "2. The service will run on:"
echo "   http://localhost:5001"
echo ""
echo "3. API Endpoints:"
echo "   POST /api/predict-risk - Predict patient risk"
echo "   POST /api/ask-assistant - Ask hospital assistant"
echo "   GET /api/hospital-stats - Get hospital statistics"
echo "   GET /api/model-info - Get model information"
echo ""
echo "4. Configure in Node.js backend:"
echo "   - Update ML_SERVICE_URL in backend/.env"
echo "   - Set ML_SERVICE_URL=http://localhost:5001"
echo ""
echo "Happy coding! 🚀"
echo ""
