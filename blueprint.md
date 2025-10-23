# 🧭 360-Degree Feedback Web Application  

A comprehensive web-based application for conducting 360-degree performance reviews. This system allows organizations to evaluate employees through multiple perspectives including self-assessment, manager feedback, peer reviews, and subordinate feedback.

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin/Employee)
- Secure password hashing

### 👥 Employee Management (Admin)
- Create, read, update, delete employees
- Set manager-subordinate relationships
- View organizational hierarchy

### 📊 Review Cycle Management (Admin)
- Create and manage review periods
- Set start and end dates
- Track cycle status

### 📝 Question & Category Management (Admin)
- Create evaluation categories (Leadership, Communication, etc.)
- Add custom questions per category
- Organize questions by competency areas

### 🎯 Assignment Management (Admin)
- Assign reviewers to reviewees
- Set relationship types (Self, Manager, Peer, Subordinate)
- Track assignment completion

### 📋 Feedback Collection (Employee)
- Interactive feedback forms with 1-5 star ratings
- Optional comments for each question
- Progress tracking across categories
- Save and resume functionality

### 📈 Reporting & Analytics (Admin)
- Comprehensive dashboard with key metrics
- Score analysis by category and relationship type
- Completion rate tracking
- Data visualization with charts
- Export capabilities

## 🛠️ Technology Stack

### Backend
- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **Prisma** ORM with **SQLite** database
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Express Validator** for input validation

### Frontend
- **React 18** with **TypeScript**
- **Material-UI (MUI)** for modern UI components
- **React Router** for navigation
- **React Query** for data fetching and caching
- **Recharts** for data visualization
- **React Hook Form** for form management

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd 360-apps
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up the database**
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev
   node scripts/seed.js
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

This will start:
- Backend API server on `http://localhost:5100`
- Frontend React app on `http://localhost:5200`

### Default Login Credentials

**Admin Account:**
- Email: `admin@company.com`
- Password: `admin123`

**Employee Accounts:**
- Email: `employee@company.com` (John Employee)
- Password: `employee123`
- Email: `jane@company.com` (Jane Smith)  
- Password: `employee123`
- Email: `bob@company.com` (Bob Johnson)
- Password: `employee123`

## 📱 Usage

### For Administrators

1. **Login** with admin credentials
2. **Manage Employees** - Add, edit, or remove employees
3. **Create Review Cycles** - Set up new evaluation periods
4. **Set up Categories & Questions** - Define evaluation criteria
5. **Assign Reviews** - Create reviewer-reviewee relationships
6. **View Reports** - Analyze feedback data and completion rates

### For Employees

1. **Login** with employee credentials
2. **View Assignments** - See pending feedback tasks
3. **Complete Feedback** - Fill out evaluation forms
4. **Track Progress** - Monitor completion status

## 🗄️ Database Schema

The application uses a well-structured relational database with the following main entities:

- **Users** - Employee and admin accounts
- **Review Cycles** - Evaluation periods
- **Categories** - Competency areas
- **Questions** - Evaluation criteria
- **Review Assignments** - Reviewer-reviewee relationships
- **Feedbacks** - Actual evaluation responses

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5100
NODE_ENV="development"
```

### Database Migration

To reset the database:
```bash
cd backend
npx prisma migrate reset
node scripts/seed.js
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration (Admin only)
- `GET /api/auth/me` - Get current user

### Employee Management
- `GET /api/employees` - List all employees
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Review Cycles
- `GET /api/review-cycles` - List review cycles
- `POST /api/review-cycles` - Create review cycle
- `PUT /api/review-cycles/:id` - Update review cycle
- `DELETE /api/review-cycles/:id` - Delete review cycle

### Categories & Questions
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `GET /api/questions` - List questions
- `POST /api/questions` - Create question

### Assignments & Feedback
- `GET /api/assignments` - List assignments
- `POST /api/assignments` - Create assignment
- `GET /api/assignments/my-assignments` - Get user's assignments
- `POST /api/feedbacks` - Submit feedback
- `GET /api/feedbacks/assignment/:id` - Get assignment feedbacks

### Reports
- `GET /api/reports/summary` - Get summary statistics
- `GET /api/reports/scores-by-category` - Get scores by category
- `GET /api/reports/detailed` - Get detailed report

## 🎨 UI/UX Features

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Modern Material Design** - Clean, intuitive interface
- **Dark/Light Theme Support** - Customizable appearance
- **Real-time Updates** - Live data synchronization
- **Interactive Charts** - Visual data representation
- **Progress Indicators** - Clear completion tracking

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt encryption
- **Input Validation** - Server-side validation
- **Rate Limiting** - API request throttling
- **CORS Protection** - Cross-origin security
- **SQL Injection Prevention** - Prisma ORM protection

## 🚀 Deployment

### Production Build

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Build the backend:**
   ```bash
   cd backend
   npm run build
   ```

3. **Start production server:**
   ```bash
   cd backend
   npm start
   ```

### Environment Setup

For production deployment:
- Use a production database (PostgreSQL/MySQL)
- Set secure JWT secrets
- Configure proper CORS origins
- Set up SSL certificates
- Use environment-specific configurations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔮 Future Enhancements

- **Email Notifications** - Automated reminders
- **PDF Export** - Generate reports
- **Advanced Analytics** - More detailed insights
- **Mobile App** - Native mobile support
- **SSO Integration** - Enterprise authentication
- **Weighted Scoring** - Custom scoring systems
- **Multi-language Support** - Internationalization

---

Built with ❤️ for modern performance management