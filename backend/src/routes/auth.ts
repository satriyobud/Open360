import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Register (Admin only)
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['ADMIN', 'EMPLOYEE']).withMessage('Role must be ADMIN or EMPLOYEE'),
  body('managerId').optional().isInt().withMessage('Manager ID must be a number')
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, managerId } = req.body;

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

    // Create user
    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, manager_id, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [name, email, passwordHash, role, managerId || null]
    ) as any;

    const userId = result.insertId;

    // Fetch created user
    const users = await query(
      `SELECT id, name, email, role, manager_id, created_at 
       FROM users WHERE id = ?`,
      [userId]
    ) as any[];

    const user = users[0];

    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user with manager info
    const users = await query(
      `SELECT u.id, u.name, u.email, u.password_hash, u.role, u.manager_id,
              m.id as manager_id_full, m.name as manager_name, m.email as manager_email
       FROM users u
       LEFT JOIN users m ON u.manager_id = m.id
       WHERE u.email = ?`,
      [email]
    ) as any[];

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        manager: user.manager_id_full ? {
          id: user.manager_id_full,
          name: user.manager_name,
          email: user.manager_email
        } : null
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req: any, res: any) => {
  try {
    // Get user with manager
    const users = await query(
      `SELECT u.id, u.name, u.email, u.role, u.manager_id,
              m.id as manager_id_full, m.name as manager_name, m.email as manager_email
       FROM users u
       LEFT JOIN users m ON u.manager_id = m.id
       WHERE u.id = ?`,
      [req.user.id]
    ) as any[];

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // Get subordinates
    const subordinates = await query(
      `SELECT id, name, email FROM users WHERE manager_id = ?`,
      [req.user.id]
    ) as any[];

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      manager: user.manager_id_full ? {
        id: user.manager_id_full,
        name: user.manager_name,
        email: user.manager_email
      } : null,
      subordinates: subordinates
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
