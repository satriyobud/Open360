# 360-Degree Feedback Application

A comprehensive web-based 360-degree feedback system built with React, Node.js, and MySQL. This application allows organizations to conduct multi-source feedback reviews where employees can provide feedback on their colleagues, managers, and themselves.

## ⚡ Quick Start

```bash
# 1. Clone and setup
git clone <repository-url>
cd 360-apps
chmod +x setup.sh && ./setup.sh

# 2. Run the application
npm run dev

# 3. Access the app
# Frontend: http://localhost:5200
# Backend: http://localhost:5100
# Login: admin@company.com / admin123
```

**Having port issues?** See [Troubleshooting](#-troubleshooting) section below.

## 🚀 Features

### Admin Features
- **Dashboard Overview** - Real-time statistics and progress tracking
- **Employee Management** - Add, edit, and manage employee accounts
- **Review Cycle Management** - Create and manage feedback cycles
- **Category & Question Management** - Customize feedback categories and questions
- **Assignment Management** - Assign reviewers to reviewees
- **Feedback Management** - Monitor and review submitted feedback
- **Reports Dashboard** - Comprehensive analytics and reporting

### Employee Features
- **Personal Dashboard** - View assigned feedback tasks
- **Interactive Feedback Forms** - Google-style star rating system
- **Assignment Tracking** - Monitor pending and completed reviews
- **Progress Indicators** - Visual feedback on completion status

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Material-UI
- **Backend**: Node.js, Express, TypeScript
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT-based with role management
- **State Management**: React Query for data fetching

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- npm (v8 or higher)
- MySQL (v8.0 or higher)
- Git

## 🔧 Installation

### Option 1: Automated Setup (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd 360-apps

# Run the setup script (installs all dependencies and seeds database)
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd 360-apps
```

#### 2. Install All Dependencies
```bash
# Install root, backend, and frontend dependencies
npm run install-all
```

#### 3. Set Up MySQL Database

**Prerequisites**: Make sure you have MySQL installed and running on your system.

1. **Create a MySQL database**:
```bash
mysql -u root -p
CREATE DATABASE 360_feedback;
EXIT;
```

2. **Configure environment variables**:
Create a `.env` file in the `backend` directory:
```bash
cd backend
```

Create `.env` with the following content:
```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/360_feedback"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=5100
NODE_ENV="development"
```

Replace `YOUR_PASSWORD` with your MySQL root password.

3. **Run Prisma migrations**:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

#### 4. Seed the Database
```bash
node scripts/seed.js
```

## 🚀 Running the Application

### Quick Start (Recommended)
The easiest way to run the entire application is using the root package script:

```bash
# From the project root directory
npm run dev
```

This will start both the backend and frontend servers simultaneously:
- **Backend API**: `http://localhost:5100`
- **Frontend App**: `http://localhost:5200`

### Alternative: Run Servers Separately

#### Start Backend Server
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:5100`

#### Start Frontend Application (in a new terminal)
```bash
cd frontend
npm start
```
The frontend will run on `http://localhost:5200`

### Handling Port Conflicts

If you encounter "address already in use" errors, kill existing processes:

```bash
# Kill processes on ports 5100 and 5200
lsof -ti:5100 | xargs kill -9
lsof -ti:5200 | xargs kill -9

# Then restart the application
npm run dev
```

### One-Command Setup and Run

For a completely fresh setup:

```bash
# Install all dependencies and start the application
npm run install-all && npm run dev
```

## 👥 Default User Accounts

### Admin Account
- **Email**: `admin@company.com`
- **Password**: `admin123`
- **Role**: Admin/HR

### Employee Accounts
- **Email**: `employee@company.com` (John Employee)
- **Password**: `employee123`
- **Email**: `jane@company.com` (Jane Smith)
- **Password**: `employee123`
- **Email**: `bob@company.com` (Bob Johnson)
- **Password**: `employee123`

## 📝 How to Use the Application

### For Administrators

#### 1. Login as Admin
- Navigate to `http://localhost:5200`
- Login with admin credentials
- Access the admin dashboard

#### 2. Create Review Cycles
- Go to "Review Cycles" in the sidebar
- Click "Create New Cycle"
- Set cycle name, start date, and end date
- Save the cycle

#### 3. Manage Employees
- Go to "Employee Management"
- Add new employees or edit existing ones
- Set employee roles and details

#### 4. Create Feedback Categories and Questions
- Go to "Categories" to create feedback categories (e.g., Leadership, Communication)
- Go to "Questions" to add questions for each category
- Questions use a 1-5 star rating system

#### 5. Assign Reviewers
- Go to "Assignments"
- Create assignments by selecting:
  - Review cycle
  - Reviewer (who will give feedback)
  - Reviewee (who will receive feedback)
  - Relationship type (SELF, MANAGER, PEER, DIRECT_REPORT)

### For Employees

#### 1. Login as Employee
- Navigate to `http://localhost:5200`
- Login with employee credentials
- Access the employee dashboard

#### 2. View Assignments
- Go to "My Assignments" in the sidebar
- View pending and completed feedback tasks
- See assignment details and deadlines

#### 3. Provide Feedback
- Click "Start Feedback" on a pending assignment
- Navigate through different categories
- Rate each question using the 1-5 star system (Google-style)
- Add optional comments for each question
- Use "Next Category" to move between categories
- Click "Submit All" on the final category to complete

#### 4. Track Progress
- View completion status of all assignments
- See which feedback has been submitted
- Monitor pending tasks

## ⭐ Feedback Form Features

### Star Rating System
- **Interactive Stars**: Click to select rating (1-5 stars)
- **Visual Feedback**: Stars fill with color when selected
- **Hover Effects**: Stars highlight on hover for better UX
- **Clear Labels**: Each rating level has descriptive text

### Category Navigation
- **Progress Stepper**: Visual indicator of current category
- **Smooth Transitions**: Automatic scroll-to-top when changing categories
- **Validation**: Must complete all questions before proceeding
- **Save Progress**: Form data is preserved when navigating

### Comments System
- **Optional Comments**: Add detailed feedback for each question
- **Rich Text**: Multi-line text input for comprehensive feedback
- **Character Limits**: Reasonable limits to encourage concise feedback

## 📊 Reporting and Analytics

### Admin Reports
- **Completion Rates**: Track assignment completion percentages
- **Average Scores**: View aggregated feedback scores by category
- **Response Analysis**: Detailed breakdown of feedback responses
- **Trend Analysis**: Historical data and progress tracking

### Employee Insights
- **Personal Progress**: Individual completion tracking
- **Assignment History**: View all completed feedback tasks
- **Performance Metrics**: Access to own feedback scores (when available)

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Different permissions for admin and employee roles
- **Assignment Authorization**: Users can only access their assigned feedback
- **Input Validation**: Server-side validation for all form inputs
- **CORS Protection**: Configured for secure cross-origin requests

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use (EADDRINUSE Error)
This is the most common issue when starting the application:

```bash
# Kill processes on ports 5100 and 5200
lsof -ti:5100 | xargs kill -9
lsof -ti:5200 | xargs kill -9

# Alternative: Find and kill specific processes
ps aux | grep node
kill -9 <process-id>

# Then restart the application
npm run dev
```

#### Database Issues

**MySQL Connection Error:**
- Ensure MySQL server is running: `sudo systemctl start mysql` (Linux) or start MySQL service (Mac/Windows)
- Verify database exists: `mysql -u root -p -e "SHOW DATABASES;"`
- Check connection string in `.env` file matches your MySQL credentials

**Reset Database:**
```bash
# Drop and recreate database (WARNING: This deletes all data)
cd backend
mysql -u root -p -e "DROP DATABASE IF EXISTS 360_feedback; CREATE DATABASE 360_feedback;"

# Run migrations and seed
npx prisma migrate deploy
node scripts/seed.js
```

**Migration Issues:**
```bash
# If migrations fail, reset and start fresh
cd backend
npx prisma migrate reset
npx prisma migrate dev --name init
node scripts/seed.js
```

#### Frontend Build Issues
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### Backend Won't Start
```bash
# Check if database exists and is accessible
cd backend
npx prisma generate
npx prisma db push
node scripts/seed.js
```

#### Concurrently Issues
If the `npm run dev` command fails:
```bash
# Install concurrently globally
npm install -g concurrently

# Or run servers separately in different terminals
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm start
```

#### ngrok "Invalid Host Header" Error
When using ngrok to share your app, you might get "Invalid Host header" error:
```bash
# Fix: Update frontend package.json start script
# Change: "start": "PORT=5200 react-scripts start"
# To: "start": "PORT=5200 DANGEROUSLY_DISABLE_HOST_CHECK=true react-scripts start"

# Then restart the application
npm run dev
```

### Getting Help
- Check the browser console for error messages
- Verify both backend and frontend servers are running
- Ensure database is properly seeded with sample data
- Check network connectivity between frontend and backend

## 📁 Project Structure

```
360-apps/
├── backend/
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Authentication & validation
│   │   └── config/         # Database configuration
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── migrations/     # Database migrations
│   └── scripts/
│       └── seed.js        # Database seeding script
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Main page components
│   │   ├── services/      # API service layer
│   │   └── contexts/      # React contexts
│   └── public/            # Static assets
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section above
- Review the code documentation

---

**Happy Feedback Giving! 🎉**
