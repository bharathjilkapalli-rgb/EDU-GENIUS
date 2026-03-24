#!/bin/bash
# EduGenius Quick Start Script

echo "🎓 EduGenius — AI Educational Platform"
echo "======================================="

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.11+"
    exit 1
fi

# Check for Node
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

echo ""
echo "📦 Setting up Backend..."
cd backend

# Create venv if not exists
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null

pip install -r requirements.txt -q

# Create .env if not exists
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo ""
    echo "⚠️  Please edit backend/.env and add your ANTHROPIC_API_KEY"
    echo "   Get your key at: https://console.anthropic.com"
    echo ""
fi

echo ""
echo "📦 Setting up Frontend..."
cd ../frontend
npm install --silent

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the app:"
echo "  Terminal 1: cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
echo "Then open: http://localhost:3000"
