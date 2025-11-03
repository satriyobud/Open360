# Getting Started with Open360

## Prerequisites

Before you begin, ensure you have:
- Node.js (v18 or higher)
- npm (v8 or higher)
- MySQL (v8.0 or higher)
- Git

## Quick Installation

```bash
# 1. Clone the repository
git clone https://github.com/satriyobud/Open360.git
cd Open360

# 2. Run automated setup
chmod +x setup.sh
./setup.sh

# 3. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials

# 4. Create database
mysql -u root -p
CREATE DATABASE 360_feedback;
EXIT;

# 5. Seed database
cd backend
node scripts/seed.js

# 6. Start the application
cd ..
npm run dev
```

## Access the Application

- **Frontend**: http://localhost:5200
- **Backend API**: http://localhost:5100
- **Health Check**: http://localhost:5100/health

## Default Login

- **Admin**: `admin@company.com` / `admin123`

For demo accounts, see [[Installation Guide]].

## Next Steps

- [[Configuration]] - Configure environment variables
- [[Admin Guide]] - Learn how to use admin features
- [[Employee Guide]] - Learn how to submit feedback

