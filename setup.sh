#!/bin/bash

echo "🚀 Setting up Open360..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL client not found. Please ensure MySQL is installed."
    echo "   You can still continue, but you'll need to create the database manually."
fi

echo "✅ Node.js and npm are installed"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Setup environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your database credentials"
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

# Go back to root
cd ..

echo "✅ Setup complete!"
echo ""
echo "🎉 Open360 is ready!"
echo ""
echo "⚠️  IMPORTANT: Before starting, make sure to:"
echo "   1. Create MySQL database: CREATE DATABASE 360_feedback;"
echo "   2. Configure backend/.env with your database credentials"
echo "   3. Run: cd backend && node scripts/seed.js (to seed initial data)"
echo ""
echo "To start the application:"
echo "  npm run dev"
echo ""
echo "This will start:"
echo "  - Backend API: http://localhost:5100"
echo "  - Frontend App: http://localhost:5200"
echo ""
echo "Default login credentials:"
echo "  Admin: admin@company.com / admin123"
echo ""
echo "Happy coding! 🚀"
