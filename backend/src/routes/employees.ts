import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Get all employees (Admin only)
router.get('/', authenticateToken, requireRole(['ADMIN']), async (req: any, res: any) => {
  try {
    const employees = await prisma.user.findMany({
      where: { role: 'EMPLOYEE' },
      include: {
        manager: {
          select: { id: true, name: true, email: true }
        },
        subordinates: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(employees);
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

    const employee = await prisma.user.findUnique({
      where: { id: employeeId },
      include: {
        manager: {
          select: { id: true, name: true, email: true }
        },
        subordinates: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(employee);
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
  body('managerId').optional().isInt().withMessage('Manager ID must be a number')
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, managerId } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 10);

    // Create employee
    const employee = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'EMPLOYEE',
        managerId: managerId || null
      },
      include: {
        manager: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json({ message: 'Employee created successfully', employee });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update employee (Admin only)
router.put('/:id', authenticateToken, requireRole(['ADMIN']), [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('managerId').optional().isInt().withMessage('Manager ID must be a number')
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const employeeId = parseInt(id);
    const { name, email, managerId } = req.body;

    // Check if employee exists
    const existingEmployee = await prisma.user.findUnique({
      where: { id: employeeId }
    });

    if (!existingEmployee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Check if email is already taken by another user
    if (email && email !== existingEmployee.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExists) {
        return res.status(400).json({ error: 'Email already taken' });
      }
    }

    // Update employee
    const employee = await prisma.user.update({
      where: { id: employeeId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(managerId !== undefined && { managerId: managerId || null })
      },
      include: {
        manager: {
          select: { id: true, name: true, email: true }
        },
        subordinates: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json({ message: 'Employee updated successfully', employee });
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
    const existingEmployee = await prisma.user.findUnique({
      where: { id: employeeId }
    });

    if (!existingEmployee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Delete employee
    await prisma.user.delete({
      where: { id: employeeId }
    });

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

