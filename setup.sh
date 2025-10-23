#!/bin/bash

echo "🚀 Setting up 360-Degree Feedback Application..."

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

echo "✅ Node.js and npm are installed"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Setting up database..."
npx prisma migrate dev --name init

# Seed the database
echo "🌱 Seeding database with sample data..."
node scripts/seed.js

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

# Go back to root
cd ..

echo "✅ Setup complete!"
echo ""
echo "🎉 Your 360-Degree Feedback Application is ready!"
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
echo "  Employee: employee@company.com / employee123"
echo ""
echo "Happy coding! 🚀"
