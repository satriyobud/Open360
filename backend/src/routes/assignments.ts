import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Get all assignments
router.get('/', authenticateToken, async (req: any, res: any) => {
  try {
    const assignments = await prisma.reviewAssignment.findMany({
      include: {
        reviewCycle: {
          select: { id: true, name: true, startDate: true, endDate: true }
        },
        reviewer: {
          select: { id: true, name: true, email: true }
        },
        reviewee: {
          select: { id: true, name: true, email: true }
        },
        feedbacks: {
          include: {
            question: {
              include: {
                category: {
                  select: { id: true, name: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(assignments);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get assignments for current user (as reviewer)
router.get('/my-assignments', authenticateToken, async (req: any, res) => {
  try {
    const assignments = await prisma.reviewAssignment.findMany({
      where: { reviewerId: req.user.id },
      include: {
        reviewCycle: {
          select: { id: true, name: true, startDate: true, endDate: true }
        },
        reviewee: {
          select: { id: true, name: true, email: true }
        },
        feedbacks: {
          include: {
            question: {
              include: {
                category: {
                  select: { id: true, name: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(assignments);
  } catch (error) {
    console.error('Get my assignments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get assignment by ID
router.get('/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const assignmentId = parseInt(id);

    const assignment = await prisma.reviewAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        reviewCycle: {
          select: { id: true, name: true, startDate: true, endDate: true }
        },
        reviewer: {
          select: { id: true, name: true, email: true }
        },
        reviewee: {
          select: { id: true, name: true, email: true }
        },
        feedbacks: {
          include: {
            question: {
              include: {
                category: {
                  select: { id: true, name: true }
                }
              }
            }
          }
        }
      }
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check if the current user is authorized to access this assignment
    if (assignment.reviewerId !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to access this assignment' });
    }

    res.json(assignment);
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create assignment (Admin only)
router.post('/', authenticateToken, requireRole(['ADMIN']), [
  body('reviewCycleId').isInt().withMessage('Review cycle ID is required'),
  body('reviewerId').isInt().withMessage('Reviewer ID is required'),
  body('revieweeId').isInt().withMessage('Reviewee ID is required'),
  body('relationType').isIn(['SELF', 'MANAGER', 'PEER', 'SUBORDINATE']).withMessage('Invalid relation type')
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reviewCycleId, reviewerId, revieweeId, relationType } = req.body;

    // Check if review cycle exists
    const reviewCycle = await prisma.reviewCycle.findUnique({
      where: { id: reviewCycleId }
    });

    if (!reviewCycle) {
      return res.status(404).json({ error: 'Review cycle not found' });
    }

    // Check if reviewer exists
    const reviewer = await prisma.user.findUnique({
      where: { id: reviewerId }
    });

    if (!reviewer) {
      return res.status(404).json({ error: 'Reviewer not found' });
    }

    // Check if reviewee exists
    const reviewee = await prisma.user.findUnique({
      where: { id: revieweeId }
    });

    if (!reviewee) {
      return res.status(404).json({ error: 'Reviewee not found' });
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.reviewAssignment.findFirst({
      where: {
        reviewCycleId,
        reviewerId,
        revieweeId
      }
    });

    if (existingAssignment) {
      return res.status(400).json({ error: 'Assignment already exists' });
    }

    const assignment = await prisma.reviewAssignment.create({
      data: {
        reviewCycleId,
        reviewerId,
        revieweeId,
        relationType
      },
      include: {
        reviewCycle: {
          select: { id: true, name: true, startDate: true, endDate: true }
        },
        reviewer: {
          select: { id: true, name: true, email: true }
        },
        reviewee: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json({ message: 'Assignment created successfully', assignment });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update assignment (Admin only)
router.put('/:id', authenticateToken, requireRole(['ADMIN']), [
  body('relationType').optional().isIn(['SELF', 'MANAGER', 'PEER', 'SUBORDINATE']).withMessage('Invalid relation type')
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const assignmentId = parseInt(id);
    const { relationType } = req.body;

    // Check if assignment exists
    const existingAssignment = await prisma.reviewAssignment.findUnique({
      where: { id: assignmentId }
    });

    if (!existingAssignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const assignment = await prisma.reviewAssignment.update({
      where: { id: assignmentId },
      data: {
        ...(relationType && { relationType })
      },
      include: {
        reviewCycle: {
          select: { id: true, name: true, startDate: true, endDate: true }
        },
        reviewer: {
          select: { id: true, name: true, email: true }
        },
        reviewee: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json({ message: 'Assignment updated successfully', assignment });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete assignment (Admin only)
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const assignmentId = parseInt(id);

    // Check if assignment exists
    const existingAssignment = await prisma.reviewAssignment.findUnique({
      where: { id: assignmentId }
    });

    if (!existingAssignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    await prisma.reviewAssignment.delete({
      where: { id: assignmentId }
    });

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

