@echo off
REM ML Service Setup - Windows
REM Installs Python dependencies and trains model

setlocal enabledelayedexpansion

echo.
echo 🤖 Hospital ML Service Setup
echo =============================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.9 or higher.
    echo    Visit: https://www.python.org/downloads/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo ✅ %PYTHON_VERSION%
echo.

REM Create virtual environment
echo 📦 Creating virtual environment...
python -m venv venv

REM Activate virtual environment
call venv\Scripts\activate.bat

echo ✅ Virtual environment activated
echo.

REM Install dependencies
echo 📥 Installing dependencies...
pip install -r requirements.txt

echo ✅ Dependencies installed
echo.

REM Generate synthetic data
echo 🔄 Generating synthetic training data...
python generate_data.py

echo ✅ Data generated
echo.

REM Train model
echo 🔄 Training ML model...
python train_model.py

echo ✅ Model trained
echo.

REM Final instructions
echo 🎉 Setup Complete!
echo ====================
echo.
echo 📋 Next Steps:
echo.
echo 1. Start the ML Service:
echo    venv\Scripts\activate.bat
echo    python app.py
echo.
echo 2. The service will run on:
echo    http://localhost:5001
echo.
echo 3. API Endpoints:
echo    POST /api/predict-risk - Predict patient risk
echo    POST /api/ask-assistant - Ask hospital assistant
echo    GET /api/hospital-stats - Get hospital statistics
echo    GET /api/model-info - Get model information
echo.
echo 4. Configure in Node.js backend:
echo    - Update ML_SERVICE_URL in backend/.env
echo    - Set ML_SERVICE_URL=http://localhost:5001
echo.
echo Happy coding! 🚀
echo.
pause
