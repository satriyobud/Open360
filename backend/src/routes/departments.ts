import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Get all departments
router.get('/', authenticateToken, async (req: any, res: any) => {
  try {
    const departments = await query(
      'SELECT * FROM departments ORDER BY name ASC'
    ) as any[];

    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get department by ID
router.get('/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const departmentId = parseInt(id);

    const departments = await query(
      'SELECT * FROM departments WHERE id = ?',
      [departmentId]
    ) as any[];

    if (departments.length === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json(departments[0]);
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create department (Admin only)
router.post('/', authenticateToken, requireRole(['ADMIN']), [
  body('name').notEmpty().withMessage('Name is required')
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;

    // Check if department already exists
    const existing = await query(
      'SELECT id FROM departments WHERE name = ?',
      [name]
    ) as any[];

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Department already exists' });
    }

    // Create department
    const result = await query(
      `INSERT INTO departments (name, created_at, updated_at) 
       VALUES (?, NOW(), NOW())`,
      [name]
    ) as any;

    const departmentId = result.insertId;

    // Fetch created department
    const departments = await query(
      'SELECT * FROM departments WHERE id = ?',
      [departmentId]
    ) as any[];

    res.status(201).json({
      message: 'Department created successfully',
      department: departments[0]
    });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update department (Admin only)
router.put('/:id', authenticateToken, requireRole(['ADMIN']), [
  body('name').notEmpty().withMessage('Name is required')
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const departmentId = parseInt(id);
    const { name } = req.body;

    // Check if department exists
    const existing = await query(
      'SELECT id, name FROM departments WHERE id = ?',
      [departmentId]
    ) as any[];

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }

    // Check if name is already taken by another department
    if (name !== existing[0].name) {
      const nameExists = await query(
        'SELECT id FROM departments WHERE name = ? AND id != ?',
        [name, departmentId]
      ) as any[];

      if (nameExists.length > 0) {
        return res.status(400).json({ error: 'Department name already taken' });
      }
    }

    // Update department
    await query(
      'UPDATE departments SET name = ?, updated_at = NOW() WHERE id = ?',
      [name, departmentId]
    );

    // Fetch updated department
    const departments = await query(
      'SELECT * FROM departments WHERE id = ?',
      [departmentId]
    ) as any[];

    res.json({
      message: 'Department updated successfully',
      department: departments[0]
    });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete department (Admin only)
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const departmentId = parseInt(id);

    // Check if department exists
    const existing = await query(
      'SELECT id FROM departments WHERE id = ?',
      [departmentId]
    ) as any[];

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }

    // Delete department (will set department_id to NULL in users due to ON DELETE SET NULL)
    await query('DELETE FROM departments WHERE id = ?', [departmentId]);

    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

