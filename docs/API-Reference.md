# API Reference

All API endpoints require authentication via JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

Base URL: `http://localhost:5100/api`

## Authentication

### POST /auth/login
Login and receive JWT token.

**Request Body:**
```json
{
  "email": "admin@company.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "admin@company.com",
    "name": "Admin",
    "role": "ADMIN"
  }
}
```

### GET /auth/me
Get current authenticated user.

**Response:**
```json
{
  "id": 1,
  "email": "admin@company.com",
  "name": "Admin",
  "role": "ADMIN"
}
```

## Employees

### GET /employees
Get all employees (Admin only).

### POST /employees
Create employee (Admin only).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "managerId": 2,
  "departmentId": 1
}
```

### PUT /employees/:id
Update employee (Admin only).

### DELETE /employees/:id
Delete employee (Admin only).

### POST /employees/reset
Reset all non-admin users (Admin only). Preserves admins, questions, categories, departments.

## Departments

### GET /departments
Get all departments.

### POST /departments
Create department (Admin only).

**Request Body:**
```json
{
  "name": "Engineering"
}
```

### PUT /departments/:id
Update department (Admin only).

### DELETE /departments/:id
Delete department (Admin only).

## Review Cycles

### GET /review-cycles
Get all review cycles.

### POST /review-cycles
Start new review cycle with auto-assignment (Admin only).

**Request Body:**
```json
{
  "name": "2025 Q1 Review",
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": "2025-03-31T23:59:59.000Z",
  "config": {
    "self": true,
    "manager": true,
    "subordinate": true,
    "peer": true
  }
}
```

### POST /review-cycles/reset
Reset all cycles and assignments (Admin only).

## Assignments

### GET /assignments
Get assignments for current user.

### POST /assignments
Create assignment (Admin only).

## Feedbacks

### POST /feedbacks
Submit feedback.

**Request Body:**
```json
{
  "reviewAssignmentId": 1,
  "questionId": 1,
  "score": 5,
  "comment": "Excellent work!"
}
```

### GET /feedbacks/assignment/:assignmentId
Get feedbacks for an assignment.

## Reports

### GET /reports/summary
Get dashboard summary statistics (Admin only).

**Response:**
```json
{
  "totalAssignments": 18,
  "completedAssignments": 2,
  "totalFeedbacks": 40,
  "averageScore": 4.0,
  "completionRate": 11.11,
  "overallStats": {
    "totalUsers": 7,
    "totalReviewCycles": 1,
    "totalCategories": 4,
    "totalQuestions": 20
  }
}
```

### GET /reports/pairs
Get reviewer → reviewee pairs with averages (Admin only).

### GET /reports/pair-categories
Get category breakdown for specific pair (Admin only).

**Query Parameters:**
- `reviewerId` (required)
- `revieweeId` (required)
- `reviewCycleId` (optional)

---

For complete endpoint documentation, see the source code in `backend/src/routes/`.

