import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Get all questions
router.get('/', authenticateToken, async (req: any, res: any) => {
  try {
    const questions = await query(
      `SELECT q.*, c.id as category_id_full, c.name as category_name
       FROM questions q
       JOIN categories c ON q.category_id = c.id
       ORDER BY c.name ASC, q.created_at ASC`
    ) as any[];

    const formattedQuestions = questions.map(q => ({
      id: q.id,
      categoryId: q.category_id,
      text: q.text,
      createdAt: q.created_at,
      updatedAt: q.updated_at,
      category: {
        id: q.category_id_full,
        name: q.category_name
      }
    }));

    res.json(formattedQuestions);
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get questions by category
router.get('/category/:categoryId', authenticateToken, async (req: any, res: any) => {
  try {
    const { categoryId } = req.params;
    const catId = parseInt(categoryId);

    const questions = await query(
      `SELECT q.*, c.id as category_id_full, c.name as category_name
       FROM questions q
       JOIN categories c ON q.category_id = c.id
       WHERE q.category_id = ?
       ORDER BY q.created_at ASC`,
      [catId]
    ) as any[];

    const formattedQuestions = questions.map(q => ({
      id: q.id,
      categoryId: q.category_id,
      text: q.text,
      createdAt: q.created_at,
      updatedAt: q.updated_at,
      category: {
        id: q.category_id_full,
        name: q.category_name
      }
    }));

    res.json(formattedQuestions);
  } catch (error) {
    console.error('Get questions by category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get question by ID
router.get('/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const questionId = parseInt(id);

    const questions = await query(
      `SELECT q.*, c.id as category_id_full, c.name as category_name, c.description as category_description
       FROM questions q
       JOIN categories c ON q.category_id = c.id
       WHERE q.id = ?`,
      [questionId]
    ) as any[];

    if (questions.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const q = questions[0];
    res.json({
      id: q.id,
      categoryId: q.category_id,
      text: q.text,
      createdAt: q.created_at,
      updatedAt: q.updated_at,
      category: {
        id: q.category_id_full,
        name: q.category_name,
        description: q.category_description
      }
    });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create question (Admin only)
router.post('/', authenticateToken, requireRole(['ADMIN']), [
  body('categoryId').isInt().withMessage('Category ID is required'),
  body('text').notEmpty().withMessage('Question text is required')
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { categoryId, text } = req.body;

    // Check if category exists
    const categories = await query(
      'SELECT id FROM categories WHERE id = ?',
      [categoryId]
    ) as any[];

    if (categories.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const result = await query(
      `INSERT INTO questions (category_id, text, created_at, updated_at) 
       VALUES (?, ?, NOW(), NOW())`,
      [categoryId, text]
    ) as any;

    const questionId = result.insertId;
    const questions = await query(
      `SELECT q.*, c.id as category_id_full, c.name as category_name
       FROM questions q
       JOIN categories c ON q.category_id = c.id
       WHERE q.id = ?`,
      [questionId]
    ) as any[];

    const q = questions[0];
    res.status(201).json({
      message: 'Question created successfully',
      question: {
        id: q.id,
        categoryId: q.category_id,
        text: q.text,
        createdAt: q.created_at,
        updatedAt: q.updated_at,
        category: {
          id: q.category_id_full,
          name: q.category_name
        }
      }
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update question (Admin only)
router.put('/:id', authenticateToken, requireRole(['ADMIN']), [
  body('categoryId').optional().isInt().withMessage('Category ID must be a number'),
  body('text').optional().notEmpty().withMessage('Question text cannot be empty')
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const questionId = parseInt(id);
    const { categoryId, text } = req.body;

    // Check if question exists
    const existingQuestions = await query(
      'SELECT id, category_id FROM questions WHERE id = ?',
      [questionId]
    ) as any[];

    if (existingQuestions.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const existingQuestion = existingQuestions[0];

    // Check if new category exists
    if (categoryId && categoryId !== existingQuestion.category_id) {
      const categories = await query(
        'SELECT id FROM categories WHERE id = ?',
        [categoryId]
      ) as any[];

      if (categories.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }
    }

    // Build update query
    const updates: string[] = [];
    const params: any[] = [];

    if (categoryId) {
      updates.push('category_id = ?');
      params.push(categoryId);
    }
    if (text) {
      updates.push('text = ?');
      params.push(text);
    }
    updates.push('updated_at = NOW()');
    params.push(questionId);

    await query(
      `UPDATE questions SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const questions = await query(
      `SELECT q.*, c.id as category_id_full, c.name as category_name
       FROM questions q
       JOIN categories c ON q.category_id = c.id
       WHERE q.id = ?`,
      [questionId]
    ) as any[];

    const q = questions[0];
    res.json({
      message: 'Question updated successfully',
      question: {
        id: q.id,
        categoryId: q.category_id,
        text: q.text,
        createdAt: q.created_at,
        updatedAt: q.updated_at,
        category: {
          id: q.category_id_full,
          name: q.category_name
        }
      }
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete question (Admin only)
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const questionId = parseInt(id);

    // Check if question exists
    const existingQuestions = await query(
      'SELECT id FROM questions WHERE id = ?',
      [questionId]
    ) as any[];

    if (existingQuestions.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    await query('DELETE FROM questions WHERE id = ?', [questionId]);

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
