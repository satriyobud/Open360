# Installation Guide

## System Requirements

- **Node.js**: v18 or higher
- **npm**: v8 or higher  
- **MySQL**: v8.0 or higher
- **Operating System**: macOS, Linux, or Windows

## Step-by-Step Installation

### 1. Clone the Repository

```bash
git clone https://github.com/satriyobud/Open360.git
cd Open360
```

### 2. Install Dependencies

```bash
# Install all dependencies (root, backend, frontend)
npm run install-all
```

Or install separately:
```bash
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 3. Set Up MySQL Database

#### Create Database
```bash
mysql -u root -p
CREATE DATABASE 360_feedback;
EXIT;
```

#### Verify Database
```bash
mysql -u root -p -e "SHOW DATABASES LIKE '360_feedback';"
```

### 4. Configure Environment Variables

Copy the example environment file:
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

**Option 1: Using DATABASE_URL (Recommended)**
```env
NODE_ENV=development
PORT=5100
SERVE_FRONTEND=false
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DATABASE_URL=mysql://root@127.0.0.1:3306/360_feedback
```

**Option 2: Using Individual Variables**
```env
NODE_ENV=development
PORT=5100
SERVE_FRONTEND=false
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=360_feedback
```

### 5. Seed the Database

```bash
cd backend
node scripts/seed.js
cd ..
```

This creates:
- Default admin account
- Sample categories
- Sample questions

### 6. Start the Application

```bash
npm run dev
```

This starts both backend and frontend servers.

## Verification

1. **Check Backend**: Visit http://localhost:5100/health
   - Should return: `{"status":"OK",...}`

2. **Check Frontend**: Visit http://localhost:5200
   - Should show the login page

3. **Login**: Use `admin@company.com` / `admin123`

## Troubleshooting

See [[Troubleshooting]] guide for common issues.

## Production Installation

For production deployment, see [[Deployment]] guide.

