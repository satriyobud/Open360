# Open360

An open-source comprehensive web-based 360-degree feedback system built with React, Node.js, and MySQL. Open360 allows organizations to conduct multi-source feedback reviews where employees can provide feedback on their colleagues, managers, and themselves.

> 📘 For detailed documentation, see the [Documentation](./docs/) folder:
> - [Getting Started](./docs/Getting-Started.md)
> - [Installation Guide](./docs/Installation-Guide.md)
> - [API Reference](./docs/API-Reference.md)
> - [Contributing](./docs/Contributing.md)
> - [Troubleshooting](./docs/Troubleshooting.md)

## ⚡ Quick Start

```bash
# 1. Clone and setup
git clone <repository-url>
cd 360-apps
chmod +x setup.sh && ./setup.sh

# 2. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials

# 3. Run the application
npm run dev

# 4. Access the app
# Frontend: http://localhost:5200
# Backend: http://localhost:5100
# Login: admin@company.com / admin123
```

**Having port issues?** See [Troubleshooting](#-troubleshooting) section below.

## 🚀 Features

### Admin Features
- **Dashboard Overview** - Real-time statistics and progress tracking
- **Employee Management** - Add, edit, and manage employee accounts with departments
- **Department Management** - Create and manage organizational departments
- **Review Cycle Management** - Create cycles with configurable auto-assignment (Self, Manager, Subordinate, Peer)
- **Category & Question Management** - Customize feedback categories and questions
- **Assignment Management** - Assign reviewers to reviewees
- **Feedback Management** - Monitor and review submitted feedback
- **Feedback Summaries** - Reviewer → Reviewee pairs with category breakdowns
- **Reports Dashboard** - Comprehensive analytics and reporting

### Employee Features
- **Personal Dashboard** - View assigned feedback tasks
- **Interactive Feedback Forms** - Google-style star rating system
- **Assignment Tracking** - Monitor pending and completed reviews
- **Progress Indicators** - Visual feedback on completion status

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Material-UI
- **Backend**: Node.js, Express, TypeScript
- **Database**: MySQL (raw queries, no ORM)
- **Authentication**: JWT-based with role management
- **State Management**: React Query for data fetching

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm (v8 or higher)
- MySQL (v8.0 or higher)
- Git

## 🔧 Installation

### Option 1: Automated Setup (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd 360-apps

# Run the setup script (installs all dependencies)
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
Copy the example environment file:
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your database credentials:

**Option 1: Using DATABASE_URL (Recommended)**
```env
NODE_ENV=development
PORT=5100
SERVE_FRONTEND=false
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DATABASE_URL=mysql://root@127.0.0.1:3306/360_feedback
```

**Option 2: Using individual database variables**
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

3. **Create database tables**:
The tables are created automatically when you start the server, or you can create them manually using the SQL schema.

4. **Seed the Database**:
```bash
cd backend
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
lsof -ti:5100 | xargs kill -9 2>/dev/null || true
lsof -ti:5200 | xargs kill -9 2>/dev/null || true

# Then restart the application
npm run dev
```

## 👥 Default User Accounts

### Admin Account
- **Email**: `admin@company.com`
- **Password**: `admin123`
- **Role**: Admin/HR

### Demo Employee Accounts (from assignment-simulation.md)
- **Email**: `alice@example.com` (Alice Johnson - CEO)
- **Email**: `bob@example.com` (Bob Smith - Engineering Manager)
- **Email**: `carol@example.com` (Carol Lee - Design Manager)
- **Email**: `david@example.com` (David Kim - Senior Engineer)
- **Email**: `eve@example.com` (Eve Tan - Engineer)
- **Email**: `frank@example.com` (Frank Zhao - Senior Designer)
- **Email**: `grace@example.com` (Grace Liu - Designer)
- **Password**: `password123` (for all demo accounts)

## 📝 How to Use the Application

### For Administrators

#### 1. Login as Admin
- Navigate to `http://localhost:5200`
- Login with admin credentials
- Access the admin dashboard

#### 2. Manage Departments
- Go to "Departments" in the sidebar
- Create departments (e.g., Executive, Engineering, Design)
- Assign employees to departments (optional)

#### 3. Manage Employees
- Go to "Employee Management"
- Add new employees or edit existing ones
- Set employee manager and department
- **Note**: Manager must be an EMPLOYEE (not ADMIN)
- **Note**: Admins don't require department assignment

#### 4. Create Feedback Categories and Questions
- Go to "Categories" to create feedback categories (e.g., Leadership, Communication, Teamwork, Problem Solving)
- Go to "Questions" to add questions for each category
- Questions use a 1-5 star rating system

#### 5. Start Review Cycles with Auto-Assignment
- Go to "Review Cycles" in the sidebar
- Click "Start New Cycle"
- Set cycle name, start date, and end date
- **Select review types** to auto-generate:
  - ✅ Self Review
  - ✅ Manager Review
  - ✅ Subordinate Review
  - ✅ Peer Review
- The system automatically creates assignments based on organizational hierarchy

#### 6. View Feedback Summaries
- Go to "Summaries" in the sidebar
- View all reviewer → reviewee pairs with overall averages
- Click any card to see category breakdown

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

## 📊 Reporting and Analytics

### Admin Reports
- **Dashboard**: Overall statistics, completion rates, average scores
- **Summaries**: Reviewer → Reviewee pairs with category breakdowns
- **Completion Rates**: Track assignment completion percentages
- **Average Scores**: View aggregated feedback scores by category
- **Response Analysis**: Detailed breakdown of feedback responses

### Employee Insights
- **Personal Progress**: Individual completion tracking
- **Assignment History**: View all completed feedback tasks

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Different permissions for admin and employee roles
- **Assignment Authorization**: Users can only access their assigned feedback
- **Input Validation**: Server-side validation for all form inputs
- **CORS Protection**: Configured for secure cross-origin requests
- **Password Hashing**: bcrypt with salt rounds

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use (EADDRINUSE Error)
This is the most common issue when starting the application:

```bash
# Kill processes on ports 5100 and 5200
lsof -ti:5100 | xargs kill -9 2>/dev/null || true
lsof -ti:5200 | xargs kill -9 2>/dev/null || true

# Alternative: Find and kill specific processes
ps aux | grep node
kill -9 <process-id>

# Then restart the application
npm run dev
```

#### Database Issues

**MySQL Connection Error:**
- Ensure MySQL server is running:
  - **Linux**: `sudo systemctl start mysql`
  - **Mac**: `brew services start mysql` or start MySQL service
  - **Windows**: Start MySQL service from Services
- Verify database exists: `mysql -u root -p -e "SHOW DATABASES;"`
- Check connection string in `backend/.env` file matches your MySQL credentials

**Create Database Tables:**
The tables are created automatically on first run, but you can verify:
```bash
mysql -u root -p 360_feedback -e "SHOW TABLES;"
```

**Reset Database:**
```bash
# Drop and recreate database (WARNING: This deletes all data)
mysql -u root -p -e "DROP DATABASE IF EXISTS 360_feedback; CREATE DATABASE 360_feedback;"

# Tables will be created automatically when server starts
# Or seed with: cd backend && node scripts/seed.js
```

**Reset Users (Keep Admins, Questions, Categories, Departments):**
```bash
# Use the API endpoint
curl -X POST http://localhost:5100/api/employees/reset \
  -H "Authorization: Bearer <admin-token>"
```

**Reset Cycles (Keep Questions):**
```bash
# Use the API endpoint
curl -X POST http://localhost:5100/api/review-cycles/reset \
  -H "Authorization: Bearer <admin-token>"
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
mysql -u root -p -e "USE 360_feedback; SELECT 1;"

# Verify environment variables
cd backend
cat .env

# Check for TypeScript compilation errors
npm run build
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

### Getting Help
- Check the browser console for error messages
- Verify both backend and frontend servers are running
- Ensure database is properly configured
- Check network connectivity between frontend and backend
- Review [TECHNICAL_BLUEPRINT.md](./TECHNICAL_BLUEPRINT.md) for technical details

## 📁 Project Structure

```
360-apps/
├── backend/
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Authentication & validation
│   │   └── config/         # Database configuration
│   ├── scripts/
│   │   ├── seed.js         # Database seeding script
│   │   └── reset-feedback.js # Reset script
│   ├── .env.example        # Example environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── admin/     # Admin components
│   │   │   └── employee/  # Employee components
│   │   ├── pages/         # Main page components
│   │   ├── services/      # API service layer
│   │   └── contexts/      # React contexts
│   └── public/            # Static assets
├── TECHNICAL_BLUEPRINT.md # Technical documentation with ERD
├── assignment-simulation.md # Demo organization structure
├── auto-assign.md         # Auto-assignment feature spec
├── .env.example           # Root environment example
└── README.md              # This file
```

## 🔄 Data Management

### Reset Functions

**Reset All Non-Admin Users:**
- Deletes all employees and their related data (feedbacks, assignments, cycles)
- Preserves: Admins, Questions, Categories, Departments
- Endpoint: `POST /api/employees/reset` (Admin only)

**Reset All Cycles and Assignments:**
- Deletes all cycles, assignments, and feedbacks
- Preserves: Questions, Categories, Departments, Users
- Endpoint: `POST /api/review-cycles/reset` (Admin only)

## 📚 Additional Documentation

- **[TECHNICAL_BLUEPRINT.md](./TECHNICAL_BLUEPRINT.md)** - Complete technical documentation including ERD, API endpoints, and architecture
- **[assignment-simulation.md](./assignment-simulation.md)** - Demo organization structure and simulation data
- **[auto-assign.md](./auto-assign.md)** - Auto-assignment feature specification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🌟 Open Source

Open360 is an open-source project. Contributions, issues, and feature requests are welcome!

### Contributing

We welcome contributions from the community! Please see our contributing guidelines:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section above
- Review the [TECHNICAL_BLUEPRINT.md](./TECHNICAL_BLUEPRINT.md) for technical details

---

**Happy Feedback Giving! 🎉**
