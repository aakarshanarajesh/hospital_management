#!/bin/bash

# Hospital Management System - Setup Script
# This script automates the setup of both backend and frontend

echo "🏥 Hospital Management System Setup"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v14 or higher."
    exit 1
fi

echo "✅ Node.js detected: $(node --version)"
echo ""

# Check if MongoDB is running
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed. Please install MongoDB."
    echo "   Visit: https://www.mongodb.com/try/download/community"
    exit 1
fi

echo "✅ MongoDB detected"
echo ""

# Backend Setup
echo "📦 Setting up Backend..."
echo "========================"

cd backend

if [ -f "node_modules/.package-lock.json" ]; then
    echo "✅ Backend dependencies already installed"
else
    echo "📥 Installing backend dependencies..."
    npm install
fi

if [ -f ".env" ]; then
    echo "✅ .env file exists"
else
    echo "📝 Creating .env file from template..."
    cp .env.example .env
fi

echo "🌱 Seeding database..."
npm run seed

echo ""
echo "✅ Backend setup complete!"
echo "To start backend: cd backend && npm run dev"
echo ""

# Frontend Setup
echo "⚛️  Setting up Frontend..."
echo "========================="

cd ../frontend

if [ -f "node_modules/.package-lock.json" ]; then
    echo "✅ Frontend dependencies already installed"
else
    echo "📥 Installing frontend dependencies..."
    npm install
fi

if [ -f ".env" ]; then
    echo "✅ .env file exists"
else
    echo "📝 Creating .env file from template..."
    cp .env.example .env
fi

echo ""
echo "✅ Frontend setup complete!"
echo "To start frontend: cd frontend && npm run dev"
echo ""

# Final Instructions
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Start MongoDB (if not running):"
echo "   mongod"
echo ""
echo "2. Open Terminal 1 - Start Backend:"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "3. Open Terminal 2 - Start Frontend:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "4. Open Browser:"
echo "   http://localhost:3000"
echo ""
echo "🔑 Demo Credentials:"
echo "   Admin: admin@hospital.com / admin123"
echo "   Doctor: john@hospital.com / doctor123"
echo "   Staff: mary@hospital.com / staff123"
echo ""
echo "📚 Documentation:"
echo "   • README.md - Full documentation"
echo "   • QUICK_START.md - Quick setup guide"
echo "   • API_REFERENCE.md - API documentation"
echo ""
echo "Happy coding! 🚀"
