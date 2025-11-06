#!/bin/bash
set -e

echo "🔨 Building Open360 for Railway..."

# Install and build backend
echo "📦 Installing backend dependencies..."
cd backend
npm install
echo "🏗️  Building backend..."
npm run build

# Install and build frontend
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
echo "🏗️  Building frontend..."
npm run build

echo "✅ Build complete!"


