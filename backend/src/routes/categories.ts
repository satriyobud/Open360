import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Get all categories
router.get('/', authenticateToken, async (req: any, res: any) => {
  try {
    const categories = await query(
      'SELECT * FROM categories ORDER BY name ASC'
    ) as any[];

    // Get questions for each category
    const categoriesWithQuestions = await Promise.all(
      categories.map(async (cat) => {
        const questions = await query(
          'SELECT id, text, created_at FROM questions WHERE category_id = ? ORDER BY created_at ASC',
          [cat.id]
        ) as any[];

        return {
          ...cat,
          questions: questions
        };
      })
    );

    res.json(categoriesWithQuestions);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get category by ID
router.get('/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const categoryId = parseInt(id);

    const categories = await query(
      'SELECT * FROM categories WHERE id = ?',
      [categoryId]
    ) as any[];

    if (categories.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const category = categories[0];
    const questions = await query(
      'SELECT * FROM questions WHERE category_id = ? ORDER BY created_at ASC',
      [categoryId]
    ) as any[];

    res.json({
      ...category,
      questions: questions
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create category (Admin only)
router.post('/', authenticateToken, requireRole(['ADMIN']), [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional().isString().withMessage('Description must be a string')
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;

    const result = await query(
      `INSERT INTO categories (name, description, created_at, updated_at) 
       VALUES (?, ?, NOW(), NOW())`,
      [name, description || null]
    ) as any;

    const categoryId = result.insertId;
    const categories = await query(
      'SELECT * FROM categories WHERE id = ?',
      [categoryId]
    ) as any[];

    res.status(201).json({ message: 'Category created successfully', category: categories[0] });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update category (Admin only)
router.put('/:id', authenticateToken, requireRole(['ADMIN']), [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('description').optional().isString().withMessage('Description must be a string')
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const categoryId = parseInt(id);
    const { name, description } = req.body;

    // Check if category exists
    const existingCategories = await query(
      'SELECT id FROM categories WHERE id = ?',
      [categoryId]
    ) as any[];

    if (existingCategories.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Build update query
    const updates: string[] = [];
    const params: any[] = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description || null);
    }
    updates.push('updated_at = NOW()');
    params.push(categoryId);

    await query(
      `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const categories = await query(
      'SELECT * FROM categories WHERE id = ?',
      [categoryId]
    ) as any[];

    res.json({ message: 'Category updated successfully', category: categories[0] });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete category (Admin only)
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const categoryId = parseInt(id);

    // Check if category exists
    const existingCategories = await query(
      'SELECT id FROM categories WHERE id = ?',
      [categoryId]
    ) as any[];

    if (existingCategories.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if category has questions
    const questions = await query(
      'SELECT id FROM questions WHERE category_id = ?',
      [categoryId]
    ) as any[];

    if (questions.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with existing questions. Please delete questions first.' 
      });
    }

    await query('DELETE FROM categories WHERE id = ?', [categoryId]);

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
