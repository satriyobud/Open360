import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { query } from '../config/database';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Get all employees (Admin only)
router.get('/', authenticateToken, requireRole(['ADMIN']), async (req: any, res: any) => {
  try {
    const employees = await query(
      `SELECT u.id, u.name, u.email, u.role, u.manager_id, u.department_id, u.created_at, u.updated_at,
              m.id as manager_id_full, m.name as manager_name, m.email as manager_email,
              d.id as department_id_full, d.name as department_name
       FROM users u
       LEFT JOIN users m ON u.manager_id = m.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.role = 'EMPLOYEE'
       ORDER BY u.name ASC`
    ) as any[];

    // Get subordinates for each employee
    const employeesWithRelations = await Promise.all(
      employees.map(async (emp) => {
        const subordinates = await query(
          'SELECT id, name, email FROM users WHERE manager_id = ?',
          [emp.id]
        ) as any[];

        return {
          ...emp,
          manager: emp.manager_id_full ? {
            id: emp.manager_id_full,
            name: emp.manager_name,
            email: emp.manager_email
          } : null,
          department: emp.department_id_full ? {
            id: emp.department_id_full,
            name: emp.department_name
          } : null,
          subordinates: subordinates
        };
      })
    );

    res.json(employeesWithRelations);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get employee by ID
router.get('/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const employeeId = parseInt(id);

    const employees = await query(
      `SELECT u.id, u.name, u.email, u.role, u.manager_id, u.department_id, u.created_at, u.updated_at,
              m.id as manager_id_full, m.name as manager_name, m.email as manager_email,
              d.id as department_id_full, d.name as department_name
       FROM users u
       LEFT JOIN users m ON u.manager_id = m.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = ?`,
      [employeeId]
    ) as any[];

    if (employees.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const employee = employees[0];
    const subordinates = await query(
      'SELECT id, name, email FROM users WHERE manager_id = ?',
      [employeeId]
    ) as any[];

    res.json({
      ...employee,
      manager: employee.manager_id_full ? {
        id: employee.manager_id_full,
        name: employee.manager_name,
        email: employee.manager_email
      } : null,
      department: employee.department_id_full ? {
        id: employee.department_id_full,
        name: employee.department_name
      } : null,
      subordinates: subordinates
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create employee (Admin only)
router.post('/', authenticateToken, requireRole(['ADMIN']), [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  // Allow managerId to be omitted or null/empty (means no manager)
  body('managerId')
    .optional({ nullable: true })
    .custom((value) => value === null || value === '' || Number.isInteger(Number(value)))
    .withMessage('Manager ID must be a number or empty')
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    // Normalize managerId: treat empty string or null as null; else numeric
    const managerIdRaw = req.body.managerId;
    const managerId = (managerIdRaw === '' || managerIdRaw === null || managerIdRaw === undefined)
      ? null
      : Number(managerIdRaw);
    
    // Normalize departmentId: treat empty string or null as null; else numeric
    const departmentIdRaw = req.body.departmentId;
    const departmentId = (departmentIdRaw === '' || departmentIdRaw === null || departmentIdRaw === undefined)
      ? null
      : Number(departmentIdRaw);

    // Check if user already exists
    const existingUsers = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    ) as any[];

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // If managerId provided, ensure it refers to an EMPLOYEE (never admin)
    if (managerId !== null) {
      const managers = await query(
        "SELECT id FROM users WHERE id = ? AND role = 'EMPLOYEE'",
        [managerId]
      ) as any[];
      if (managers.length === 0) {
        return res.status(400).json({ error: 'Manager must be an existing EMPLOYEE' });
      }
    }

    // If departmentId provided, ensure it exists
    if (departmentId !== null) {
      const departments = await query(
        'SELECT id FROM departments WHERE id = ?',
        [departmentId]
      ) as any[];
      if (departments.length === 0) {
        return res.status(400).json({ error: 'Department not found' });
      }
    }

    // Create employee
    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, manager_id, department_id, created_at, updated_at) 
       VALUES (?, ?, ?, 'EMPLOYEE', ?, ?, NOW(), NOW())`,
      [name, email, passwordHash, managerId, departmentId]
    ) as any;

    const employeeId = result.insertId;

    // Fetch created employee with manager and department
    const employees = await query(
      `SELECT u.id, u.name, u.email, u.role, u.manager_id, u.department_id, u.created_at, u.updated_at,
              m.id as manager_id_full, m.name as manager_name, m.email as manager_email,
              d.id as department_id_full, d.name as department_name
       FROM users u
       LEFT JOIN users m ON u.manager_id = m.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = ?`,
      [employeeId]
    ) as any[];

    const employee = employees[0];

    res.status(201).json({
      message: 'Employee created successfully',
      employee: {
        ...employee,
        manager: employee.manager_id_full ? {
          id: employee.manager_id_full,
          name: employee.manager_name,
          email: employee.manager_email
        } : null,
        department: employee.department_id_full ? {
          id: employee.department_id_full,
          name: employee.department_name
        } : null
      }
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update employee (Admin only)
router.put('/:id', authenticateToken, requireRole(['ADMIN']), [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  // Allow clearing manager (null/empty)
  body('managerId')
    .optional({ nullable: true })
    .custom((value) => value === null || value === '' || Number.isInteger(Number(value)))
    .withMessage('Manager ID must be a number or empty')
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const employeeId = parseInt(id);
    const { name, email } = req.body;
    
    // Normalize managerId
    const managerIdRaw = req.body.managerId;
    const managerId = (managerIdRaw === '' || managerIdRaw === null || managerIdRaw === undefined)
      ? null
      : Number(managerIdRaw);
    
    // Normalize departmentId
    const departmentIdRaw = req.body.departmentId;
    const departmentId = (departmentIdRaw === '' || departmentIdRaw === null || departmentIdRaw === undefined)
      ? null
      : Number(departmentIdRaw);

    // Check if employee exists
    const existingEmployees = await query(
      'SELECT id, email FROM users WHERE id = ?',
      [employeeId]
    ) as any[];

    if (existingEmployees.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const existingEmployee = existingEmployees[0];

    // Check if email is already taken by another user
    if (email && email !== existingEmployee.email) {
      const emailExists = await query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, employeeId]
      ) as any[];

      if (emailExists.length > 0) {
        return res.status(400).json({ error: 'Email already taken' });
      }
    }

    // Build update query
    const updates: string[] = [];
    const params: any[] = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (email) {
      updates.push('email = ?');
      params.push(email);
    }
    if (managerIdRaw !== undefined) {
      // If provided, validate manager is EMPLOYEE when not null
      if (managerId !== null) {
        const managers = await query(
          "SELECT id FROM users WHERE id = ? AND role = 'EMPLOYEE'",
          [managerId]
        ) as any[];
        if (managers.length === 0) {
          return res.status(400).json({ error: 'Manager must be an existing EMPLOYEE' });
        }
      }
      updates.push('manager_id = ?');
      params.push(managerId);
    }
    
    if (departmentIdRaw !== undefined) {
      // If provided, validate department exists when not null
      if (departmentId !== null) {
        const departments = await query(
          'SELECT id FROM departments WHERE id = ?',
          [departmentId]
        ) as any[];
        if (departments.length === 0) {
          return res.status(400).json({ error: 'Department not found' });
        }
      }
      updates.push('department_id = ?');
      params.push(departmentId);
    }
    updates.push('updated_at = NOW()');
    params.push(employeeId);

    await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Fetch updated employee with relations
    const employees = await query(
      `SELECT u.id, u.name, u.email, u.role, u.manager_id, u.department_id, u.created_at, u.updated_at,
              m.id as manager_id_full, m.name as manager_name, m.email as manager_email,
              d.id as department_id_full, d.name as department_name
       FROM users u
       LEFT JOIN users m ON u.manager_id = m.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = ?`,
      [employeeId]
    ) as any[];

    const employee = employees[0];
    const subordinates = await query(
      'SELECT id, name, email FROM users WHERE manager_id = ?',
      [employeeId]
    ) as any[];

    res.json({
      message: 'Employee updated successfully',
      employee: {
        ...employee,
        manager: employee.manager_id_full ? {
          id: employee.manager_id_full,
          name: employee.manager_name,
          email: employee.manager_email
        } : null,
        department: employee.department_id_full ? {
          id: employee.department_id_full,
          name: employee.department_name
        } : null,
        subordinates: subordinates
      }
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete employee (Admin only)
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const employeeId = parseInt(id);

    // Check if employee exists
    const existingEmployees = await query(
      'SELECT id FROM users WHERE id = ?',
      [employeeId]
    ) as any[];

    if (existingEmployees.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Delete employee
    await query('DELETE FROM users WHERE id = ?', [employeeId]);

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset all non-admin users and their related data (Admin only) - Preserve admins, questions, categories
router.post('/reset', authenticateToken, requireRole(['ADMIN']), async (req: any, res: any) => {
  try {
    // Get all employee user IDs first
    const employees = await query(
      "SELECT id FROM users WHERE role = 'EMPLOYEE'"
    ) as any[];

    const employeeIds = employees.map((e: any) => e.id);

    if (employeeIds.length === 0) {
      return res.json({ 
        message: 'No employees to reset',
        note: 'Admins, questions, categories, and departments have been preserved'
      });
    }

    // Delete all feedbacks from assignments involving employees
    if (employeeIds.length > 0) {
      const placeholders = employeeIds.map(() => '?').join(',');
      // Get assignment IDs first
      const assignments = await query(
        `SELECT id FROM review_assignments 
         WHERE reviewer_id IN (${placeholders}) OR reviewee_id IN (${placeholders})`,
        [...employeeIds, ...employeeIds]
      ) as any[];
      
      if (assignments.length > 0) {
        const assignmentIds = assignments.map((a: any) => a.id);
        const assignmentPlaceholders = assignmentIds.map(() => '?').join(',');
        await query(
          `DELETE FROM feedbacks WHERE review_assignment_id IN (${assignmentPlaceholders})`,
          assignmentIds
        );
      }
    }

    // Delete all assignments involving employees
    if (employeeIds.length > 0) {
      const placeholders = employeeIds.map(() => '?').join(',');
      await query(
        `DELETE FROM review_assignments 
         WHERE reviewer_id IN (${placeholders}) OR reviewee_id IN (${placeholders})`,
        [...employeeIds, ...employeeIds]
      );
    }

    // Delete all review cycles
    await query('DELETE FROM review_cycles');

    // Delete all employees (non-admin users)
    await query(
      "DELETE FROM users WHERE role = 'EMPLOYEE'"
    );

    res.json({ 
      message: 'All non-admin users and their related data have been reset',
      employees_deleted: employeeIds.length,
      note: 'Admins, questions, categories, and departments have been preserved'
    });
  } catch (error) {
    console.error('Reset users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
