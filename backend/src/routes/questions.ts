import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Get all questions
router.get('/', authenticateToken, async (req: any, res: any) => {
  try {
    const questions = await prisma.question.findMany({
      include: {
        category: {
          select: { id: true, name: true }
        }
      },
      orderBy: [
        { category: { name: 'asc' } },
        { createdAt: 'asc' }
      ]
    });

    res.json(questions);
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

    const questions = await prisma.question.findMany({
      where: { categoryId: catId },
      include: {
        category: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(questions);
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

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        category: {
          select: { id: true, name: true, description: true }
        }
      }
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json(question);
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
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const question = await prisma.question.create({
      data: {
        categoryId,
        text
      },
      include: {
        category: {
          select: { id: true, name: true }
        }
      }
    });

    res.status(201).json({ message: 'Question created successfully', question });
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
    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId }
    });

    if (!existingQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Check if new category exists
    if (categoryId && categoryId !== existingQuestion.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      });

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
    }

    const question = await prisma.question.update({
      where: { id: questionId },
      data: {
        ...(categoryId && { categoryId }),
        ...(text && { text })
      },
      include: {
        category: {
          select: { id: true, name: true }
        }
      }
    });

    res.json({ message: 'Question updated successfully', question });
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
    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId }
    });

    if (!existingQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }

    await prisma.question.delete({
      where: { id: questionId }
    });

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

