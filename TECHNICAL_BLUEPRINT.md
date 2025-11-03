# 📘 Technical Blueprint - Open360

## 📋 Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Database Schema (ERD)](#database-schema-erd)
4. [API Endpoints](#api-endpoints)
5. [Technology Stack](#technology-stack)
6. [Key Features](#key-features)
7. [Deployment Architecture](#deployment-architecture)

---

## 🎯 Overview

**Open360** is an open-source comprehensive performance review application that enables organizations to collect multi-source feedback (self, manager, subordinate, and peer reviews). The system automates assignment creation, tracks completion, and provides detailed analytics for performance improvement.

### Key Capabilities
- **Configurable Auto-Assignment**: Admin selects review types (Self, Manager, Subordinate, Peer) when starting a review cycle
- **Multi-Source Feedback**: Employees receive feedback from various perspectives
- **Category-Based Questions**: Questions organized by categories (Communication, Teamwork, Leadership, Problem Solving)
- **Real-time Analytics**: Dashboard with completion rates, average scores, and detailed reports
- **Department Management**: Organizational structure with departments and reporting hierarchies

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   React Client  │◄────►│  Express API    │◄────►│   MySQL DB      │
│   (Frontend)    │      │   (Backend)     │      │   (Database)    │
│   Port 5200     │      │   Port 5100     │      │   Port 3306     │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

### Component Structure

**Frontend:**
- React 18 with TypeScript
- Material-UI (MUI) for UI components
- React Query for data fetching
- React Router for navigation
- Context API for authentication

**Backend:**
- Node.js with Express
- TypeScript for type safety
- JWT for authentication
- Raw MySQL queries (no ORM)
- Express Validator for input validation

**Database:**
- MySQL 8.0+
- JSON fields for flexible configuration
- Foreign key constraints for data integrity

---

## 📊 Database Schema (ERD)

### Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ REVIEW_ASSIGNMENTS : "reviewer"
    USERS ||--o{ REVIEW_ASSIGNMENTS : "reviewee"
    USERS }o--|| USERS : "manager_id"
    USERS }o--o| DEPARTMENTS : "department_id"
    
    DEPARTMENTS ||--o{ USERS : "has"
    
    CATEGORIES ||--o{ QUESTIONS : "has"
    QUESTIONS ||--o{ FEEDBACKS : "answered_by"
    
    REVIEW_CYCLES ||--o{ REVIEW_ASSIGNMENTS : "contains"
    REVIEW_ASSIGNMENTS ||--o{ FEEDBACKS : "receives"
    
    USERS {
        int id PK
        string name
        string email UK
        string password_hash
        enum role
        int manager_id FK
        int department_id FK
        datetime created_at
        datetime updated_at
    }
    
    DEPARTMENTS {
        int id PK
        string name UK
        datetime created_at
        datetime updated_at
    }
    
    CATEGORIES {
        int id PK
        string name
        string description
        datetime created_at
        datetime updated_at
    }
    
    QUESTIONS {
        int id PK
        int category_id FK
        string text
        datetime created_at
        datetime updated_at
    }
    
    REVIEW_CYCLES {
        int id PK
        string name
        datetime start_date
        datetime end_date
        string status
        json assignment_config
        datetime created_at
        datetime updated_at
    }
    
    REVIEW_ASSIGNMENTS {
        int id PK
        int review_cycle_id FK
        int reviewer_id FK
        int reviewee_id FK
        enum relation_type
        datetime created_at
        datetime updated_at
    }
    
    FEEDBACKS {
        int id PK
        int review_assignment_id FK
        int question_id FK
        int score
        string comment
        datetime created_at
        datetime updated_at
    }
```

### Table Descriptions

#### `users`
Stores all system users (admins and employees).
- **Role**: Enum (`ADMIN`, `EMPLOYEE`)
- **Self-Referencing**: `manager_id` references `users.id` for organizational hierarchy
- **Department**: `department_id` references `departments.id` (nullable)
- **Constraint**: Admin users should not have `manager_id` set

#### `departments`
Organizational departments.
- **Unique**: Department names must be unique

#### `categories`
Question categories (e.g., Communication, Teamwork, Leadership, Problem Solving).

#### `questions`
Questions linked to categories.
- Each question belongs to exactly one category

#### `review_cycles`
Review cycles with configurable auto-assignment.
- **assignment_config**: JSON field storing selected review types (`{self: boolean, manager: boolean, subordinate: boolean, peer: boolean}`)
- **Status**: Tracks cycle lifecycle (`draft`, `active`, `completed`)

#### `review_assignments`
Assignments created for each review relationship.
- **Relation Types**: `SELF`, `MANAGER`, `PEER`, `SUBORDINATE`
- Links reviewer and reviewee for a specific cycle

#### `feedbacks`
Individual feedback responses.
- **Score**: Integer 1-5 (rating scale)
- **Comment**: Optional text feedback
- Links assignment and question

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration (Admin only)
- `GET /api/auth/me` - Get current user

### Employees
- `GET /api/employees` - List all employees (Admin)
- `GET /api/employees/:id` - Get employee details
- `POST /api/employees` - Create employee (Admin)
- `PUT /api/employees/:id` - Update employee (Admin)
- `DELETE /api/employees/:id` - Delete employee (Admin)
- `POST /api/employees/reset` - Reset all non-admin users (Admin)

### Departments
- `GET /api/departments` - List all departments
- `GET /api/departments/:id` - Get department details
- `POST /api/departments` - Create department (Admin)
- `PUT /api/departments/:id` - Update department (Admin)
- `DELETE /api/departments/:id` - Delete department (Admin)

### Categories
- `GET /api/categories` - List all categories
- `GET /api/categories/:id` - Get category details
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Questions
- `GET /api/questions` - List all questions
- `GET /api/questions/:id` - Get question details
- `POST /api/questions` - Create question (Admin)
- `PUT /api/questions/:id` - Update question (Admin)
- `DELETE /api/questions/:id` - Delete question (Admin)

### Review Cycles
- `GET /api/review-cycles` - List all review cycles
- `GET /api/review-cycles/:id` - Get cycle details with assignments
- `POST /api/review-cycles` - Start new cycle with auto-assignment (Admin)
- `PUT /api/review-cycles/:id` - Update cycle (Admin)
- `DELETE /api/review-cycles/:id` - Delete cycle and assignments (Admin)
- `POST /api/review-cycles/reset` - Reset all cycles and assignments (Admin)

### Assignments
- `GET /api/assignments` - List assignments (filtered by user role)
- `GET /api/assignments/:id` - Get assignment details
- `POST /api/assignments` - Create manual assignment (Admin)
- `PUT /api/assignments/:id` - Update assignment (Admin)
- `DELETE /api/assignments/:id` - Delete assignment (Admin)

### Feedbacks
- `GET /api/feedbacks` - List all feedbacks (Admin)
- `GET /api/feedbacks/:id` - Get feedback details
- `GET /api/feedbacks/assignment/:assignmentId` - Get feedbacks for assignment
- `POST /api/feedbacks` - Submit feedback
- `PUT /api/feedbacks/:id` - Update feedback
- `DELETE /api/feedbacks/:id` - Delete feedback

### Reports
- `GET /api/reports/summary` - Dashboard summary statistics (Admin)
- `GET /api/reports/scores-by-category` - Scores grouped by category (Admin)
- `GET /api/reports/detailed` - Detailed report for reviewee (Admin)
- `GET /api/reports/pairs` - Reviewer → Reviewee pairs with averages (Admin)
- `GET /api/reports/pair-categories` - Category breakdown for specific pair (Admin)

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI Framework |
| TypeScript | 5.x | Type Safety |
| Material-UI (MUI) | 5.x | UI Components |
| React Query | 4.x | Data Fetching & Caching |
| React Router | 6.x | Client-side Routing |
| Axios | 1.x | HTTP Client |
| React Hot Toast | 2.x | Notifications |
| @mui/x-data-grid | 6.x | Data Tables |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express | 4.x | Web Framework |
| TypeScript | 5.x | Type Safety |
| MySQL2 | 3.x | Database Driver |
| bcryptjs | 2.x | Password Hashing |
| jsonwebtoken | 9.x | JWT Authentication |
| express-validator | 7.x | Input Validation |
| cors | 2.x | CORS Handling |
| helmet | 7.x | Security Headers |
| dotenv | 16.x | Environment Variables |
| nodemon | 3.x | Development Server |

### Database
| Technology | Version | Purpose |
|------------|---------|---------|
| MySQL | 8.0+ | Relational Database |

### Development Tools
- **nodemon**: Auto-restart on file changes
- **ts-node**: TypeScript execution
- **tsc**: TypeScript compiler

---

## ✨ Key Features

### 1. Configurable Auto-Assignment
When starting a review cycle, admins can select which review types to generate:
- ✅ Self Review
- ✅ Manager Review
- ✅ Subordinate Review
- ✅ Peer Review

**Logic:**
- **Self**: Every employee reviews themselves
- **Manager**: Employee's manager reviews them (if manager exists and is EMPLOYEE)
- **Subordinate**: Employee's direct reports review them
- **Peer**: Employees with the same manager review each other

**Constraints:**
- Admin users are never included in assignments
- Manager relationships only work for EMPLOYEE roles (not ADMIN)

### 2. Department Management
- Organizational structure with departments
- Employees can be assigned to departments
- Admins don't require department assignment

### 3. Category-Based Questions
- Questions organized by categories
- Each question belongs to one category
- Categories can have descriptions

### 4. Feedback Submission
- Star rating (1-5 scale)
- Optional comments
- One feedback per question per assignment
- Update existing feedback if already submitted

### 5. Analytics & Reporting
- **Dashboard**: Overall statistics, completion rates, average scores
- **Summary View**: Reviewer → Reviewee pairs with category breakdowns
- **Detailed Reports**: Filter by reviewee, cycle, relation type

### 6. Data Management
- **Reset Functions**:
  - Reset cycles: Deletes cycles, assignments, feedbacks (preserves questions, categories, users, departments)
  - Reset users: Deletes all non-admin users and related data (preserves admins, questions, categories, departments)

---

## 🚀 Deployment Architecture

### Local Development
```
Frontend:  http://localhost:5200
Backend:   http://localhost:5100
Database:  mysql://127.0.0.1:3306/360_feedback
```

### Production Deployment
- **Frontend**: Built and served as static files from backend
- **Backend**: Express server serves React build + API routes
- **Database**: MySQL instance (VPS/Cloud)
- **Process Manager**: PM2 (optional)
- **Reverse Proxy**: Nginx (optional)

### Environment Variables

**Backend (.env)**
```env
NODE_ENV=production
PORT=5100
DATABASE_URL=mysql://user:password@host:port/database
# OR individual DB config:
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=360_feedback
JWT_SECRET=your-secret-key
SERVE_FRONTEND=true
```

**Frontend**
- Uses relative API paths in production (`/api`)
- Falls back to `http://localhost:5100/api` in development

---

## 📝 Database Relationships

### Foreign Keys
1. **users.manager_id** → `users.id` (ON DELETE SET NULL)
2. **users.department_id** → `departments.id` (ON DELETE SET NULL)
3. **questions.category_id** → `categories.id` (ON DELETE RESTRICT)
4. **review_assignments.review_cycle_id** → `review_cycles.id` (ON DELETE RESTRICT)
5. **review_assignments.reviewer_id** → `users.id` (ON DELETE CASCADE)
6. **review_assignments.reviewee_id** → `users.id` (ON DELETE CASCADE)
7. **feedbacks.review_assignment_id** → `review_assignments.id` (ON DELETE CASCADE)
8. **feedbacks.question_id** → `questions.id` (ON DELETE RESTRICT)

### Indexes
- `users.email` (UNIQUE)
- `users.manager_id` (INDEX)
- `users.department_id` (INDEX)
- `departments.name` (UNIQUE)
- `questions.category_id` (INDEX)
- `review_assignments.review_cycle_id` (INDEX)
- `review_assignments.reviewer_id` (INDEX)
- `review_assignments.reviewee_id` (INDEX)
- `feedbacks.review_assignment_id` (INDEX)
- `feedbacks.question_id` (INDEX)

---

## 🔐 Security Features

1. **Authentication**: JWT-based authentication
2. **Authorization**: Role-based access control (ADMIN vs EMPLOYEE)
3. **Password Hashing**: bcrypt with salt rounds
4. **Input Validation**: express-validator on all endpoints
5. **CORS**: Configured for allowed origins
6. **Security Headers**: Helmet.js middleware
7. **SQL Injection Protection**: Parameterized queries (mysql2)

---

## 📈 Performance Considerations

- **Database Connection Pooling**: mysql2 connection pool (10 connections)
- **Query Optimization**: Indexed foreign keys and common lookup fields
- **Frontend Caching**: React Query for automatic caching and refetching
- **Pagination**: DataGrid supports pagination for large datasets
- **Lazy Loading**: React Router code splitting

---

## 🧪 Testing & Development

### Database Reset Scripts
- `backend/scripts/reset-feedback.js` - Reset feedback data
- API endpoint: `POST /api/employees/reset` - Reset all non-admin users
- API endpoint: `POST /api/review-cycles/reset` - Reset all cycles

### Seed Data
- Default admin: `admin@company.com` / `admin123`
- Demo users created from `assignment-simulation.md`

---

## 📚 Additional Documentation

- **README.md**: Installation and setup instructions
- **assignment-simulation.md**: Demo organization structure
- **auto-assign.md**: Auto-assignment feature specification

---

## 🔄 Future Enhancements

1. Email notifications for assignment creation
2. Feedback reminders before cycle end
3. Export reports to PDF/Excel
4. Advanced filtering and search
5. Feedback templates
6. Multi-language support
7. Mobile app (React Native)

---

**Last Updated**: January 2025
**Version**: 1.0.0

