import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Get all review cycles
router.get('/', authenticateToken, async (req: any, res: any) => {
  try {
    const reviewCycles = await prisma.reviewCycle.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        assignments: {
          include: {
            reviewer: {
              select: { id: true, name: true, email: true }
            },
            reviewee: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    res.json(reviewCycles);
  } catch (error) {
    console.error('Get review cycles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get review cycle by ID
router.get('/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const cycleId = parseInt(id);

    const reviewCycle = await prisma.reviewCycle.findUnique({
      where: { id: cycleId },
      include: {
        assignments: {
          include: {
            reviewer: {
              select: { id: true, name: true, email: true }
            },
            reviewee: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    if (!reviewCycle) {
      return res.status(404).json({ error: 'Review cycle not found' });
    }

    res.json(reviewCycle);
  } catch (error) {
    console.error('Get review cycle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create review cycle (Admin only)
router.post('/', authenticateToken, requireRole(['ADMIN']), [
  body('name').notEmpty().withMessage('Name is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required')
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, startDate, endDate } = req.body;

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    const reviewCycle = await prisma.reviewCycle.create({
      data: {
        name,
        startDate: start,
        endDate: end
      }
    });

    res.status(201).json({ message: 'Review cycle created successfully', reviewCycle });
  } catch (error) {
    console.error('Create review cycle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update review cycle (Admin only)
router.put('/:id', authenticateToken, requireRole(['ADMIN']), [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date is required')
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const cycleId = parseInt(id);
    const { name, startDate, endDate } = req.body;

    // Check if review cycle exists
    const existingCycle = await prisma.reviewCycle.findUnique({
      where: { id: cycleId }
    });

    if (!existingCycle) {
      return res.status(404).json({ error: 'Review cycle not found' });
    }

    // Validate date range if both dates are provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start >= end) {
        return res.status(400).json({ error: 'End date must be after start date' });
      }
    }

    const reviewCycle = await prisma.reviewCycle.update({
      where: { id: cycleId },
      data: {
        ...(name && { name }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) })
      }
    });

    res.json({ message: 'Review cycle updated successfully', reviewCycle });
  } catch (error) {
    console.error('Update review cycle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete review cycle (Admin only)
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const cycleId = parseInt(id);

    // Check if review cycle exists
    const existingCycle = await prisma.reviewCycle.findUnique({
      where: { id: cycleId }
    });

    if (!existingCycle) {
      return res.status(404).json({ error: 'Review cycle not found' });
    }

    // Delete review cycle (cascade will handle assignments and feedbacks)
    await prisma.reviewCycle.delete({
      where: { id: cycleId }
    });

    res.json({ message: 'Review cycle deleted successfully' });
  } catch (error) {
    console.error('Delete review cycle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

