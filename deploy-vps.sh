#!/bin/bash

echo "🚀 Deploying 360-Degree Feedback Application to VPS..."

# Update system packages
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Node.js 18.x
echo "📦 Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install PM2 and serve globally for process management
echo "📦 Installing PM2 and serve..."
npm install -g pm2 serve

# Install Git if not already installed
echo "📦 Installing Git..."
apt install -y git

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /opt/360-feedback-app
cd /opt/360-feedback-app

# Clone the repository
echo "📥 Cloning repository..."
git clone https://github.com/satriyobud/360-app.git .

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

# Set up database (using SQLite for simplicity)
echo "🗄️ Setting up database..."
npx prisma db push --force-reset

# Seed the database
echo "🌱 Seeding database with sample data..."
node scripts/seed.js

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

# Build frontend for production
echo "🏗️ Building frontend for production..."
npm run build

# Go back to root
cd ..

# Create PM2 ecosystem file
echo "⚙️ Creating PM2 configuration..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: '360-feedback-backend',
    script: 'backend/dist/index.js',
    cwd: '/opt/360-feedback-app',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5100
    }
  }, {
    name: '360-feedback-frontend',
    script: 'serve',
    args: '-s frontend/build -l 5200',
    cwd: '/opt/360-feedback-app',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
EOF

# Start the application with PM2
echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

echo "✅ Deployment complete!"
echo ""
echo "🎉 Your 360-Degree Feedback Application is now running!"
echo ""
echo "Application URLs:"
echo "  Frontend: http://202.10.47.41:5200"
echo "  Backend API: http://202.10.47.41:5100"
echo ""
echo "Default login credentials:"
echo "  Admin: admin@company.com / admin123"
echo "  Employee: jane@company.com / employee123"
echo "  Employee: bob@company.com / employee123"
echo ""
echo "PM2 Commands:"
echo "  pm2 status                    - Check app status"
echo "  pm2 logs                      - View logs"
echo "  pm2 restart 360-feedback-backend  - Restart backend"
echo "  pm2 restart 360-feedback-frontend - Restart frontend"
echo "  pm2 stop all                  - Stop all apps"
echo ""
echo "Happy coding! 🚀"
