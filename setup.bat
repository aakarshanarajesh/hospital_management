@echo off
REM Hospital Management System - Setup Script for Windows
REM This script automates the setup of both backend and frontend

setlocal enabledelayedexpansion

echo.
echo 🏥 Hospital Management System Setup
echo ======================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js v14 or higher.
    echo    Visit: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js detected: %NODE_VERSION%
echo.

REM Backend Setup
echo 📦 Setting up Backend...
echo ========================
cd backend

if exist node_modules\ (
    echo ✅ Backend dependencies already installed
) else (
    echo 📥 Installing backend dependencies...
    call npm install
)

if exist .env (
    echo ✅ .env file exists
) else (
    echo 📝 Creating .env file from template...
    copy .env.example .env >nul
)

echo 🌱 Seeding database...
call npm run seed

echo.
echo ✅ Backend setup complete!
echo To start backend: cd backend ^&^& npm run dev
echo.

REM Frontend Setup
echo ⚛️  Setting up Frontend...
echo ========================
cd ..\frontend

if exist node_modules\ (
    echo ✅ Frontend dependencies already installed
) else (
    echo 📥 Installing frontend dependencies...
    call npm install
)

if exist .env (
    echo ✅ .env file exists
) else (
    echo 📝 Creating .env file from template...
    copy .env.example .env >nul
)

echo.
echo ✅ Frontend setup complete!
echo To start frontend: cd frontend ^&^& npm run dev
echo.

REM Final Instructions
echo 🎉 Setup Complete!
echo ====================
echo.
echo 📋 Next Steps:
echo.
echo 1. Start MongoDB (if not running):
echo    mongod
echo.
echo 2. Open Command Prompt 1 - Start Backend:
echo    cd backend
echo    npm run dev
echo.
echo 3. Open Command Prompt 2 - Start Frontend:
echo    cd frontend
echo    npm run dev
echo.
echo 4. Open Browser:
echo    http://localhost:3000
echo.
echo 🔑 Demo Credentials:
echo    Admin: admin@hospital.com / admin123
echo    Doctor: john@hospital.com / doctor123
echo    Staff: mary@hospital.com / staff123
echo.
echo 📚 Documentation:
echo    • README.md - Full documentation
echo    • QUICK_START.md - Quick setup guide
echo    • API_REFERENCE.md - API documentation
echo.
echo Happy coding! 🚀
echo.
pause
