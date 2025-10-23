import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Submit feedback
router.post('/', authenticateToken, [
  body('reviewAssignmentId').isInt().withMessage('Review assignment ID is required'),
  body('questionId').isInt().withMessage('Question ID is required'),
  body('score').isInt({ min: 1, max: 5 }).withMessage('Score must be between 1 and 5'),
  body('comment').optional().custom((value) => {
    if (value === null || value === undefined || typeof value === 'string') {
      return true;
    }
    throw new Error('Comment must be a string or null');
  })
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reviewAssignmentId, questionId, score, comment } = req.body;

    // Check if assignment exists and user is the reviewer
    const assignment = await prisma.reviewAssignment.findFirst({
      where: {
        id: reviewAssignmentId,
        reviewerId: req.user.id
      }
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found or you are not authorized to provide feedback' });
    }

    // Check if question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId }
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Check if feedback already exists for this assignment and question
    const existingFeedback = await prisma.feedback.findFirst({
      where: {
        reviewAssignmentId,
        questionId
      }
    });

    let feedback;
    if (existingFeedback) {
      // Update existing feedback
      feedback = await prisma.feedback.update({
        where: { id: existingFeedback.id },
        data: {
          score,
          comment: comment || null
        },
        include: {
          question: {
            include: {
              category: {
                select: { id: true, name: true }
              }
            }
          }
        }
      });
    } else {
      // Create new feedback
      feedback = await prisma.feedback.create({
        data: {
          reviewAssignmentId,
          questionId,
          score,
          comment: comment || null
        },
        include: {
          question: {
            include: {
              category: {
                select: { id: true, name: true }
              }
            }
          }
        }
      });
    }

    res.json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get feedbacks for an assignment
router.get('/assignment/:assignmentId', authenticateToken, async (req: any, res) => {
  try {
    const { assignmentId } = req.params;
    const assignId = parseInt(assignmentId);

    // Check if assignment exists and user is the reviewer
    const assignment = await prisma.reviewAssignment.findFirst({
      where: {
        id: assignId,
        reviewerId: req.user.id
      }
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found or you are not authorized to view this feedback' });
    }

    const feedbacks = await prisma.feedback.findMany({
      where: { reviewAssignmentId: assignId },
      include: {
        question: {
          include: {
            category: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: [
        { question: { category: { name: 'asc' } } },
        { question: { createdAt: 'asc' } }
      ]
    });

    res.json(feedbacks);
  } catch (error) {
    console.error('Get feedbacks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all feedbacks (Admin only)
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const feedbacks = await prisma.feedback.findMany({
      include: {
        reviewAssignment: {
          include: {
            reviewer: {
              select: { id: true, name: true, email: true }
            },
            reviewee: {
              select: { id: true, name: true, email: true }
            },
            reviewCycle: {
              select: { id: true, name: true }
            }
          }
        },
        question: {
          include: {
            category: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(feedbacks);
  } catch (error) {
    console.error('Get all feedbacks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get feedback by ID
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const feedbackId = parseInt(id);

    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId },
      include: {
        reviewAssignment: {
          include: {
            reviewer: {
              select: { id: true, name: true, email: true }
            },
            reviewee: {
              select: { id: true, name: true, email: true }
            },
            reviewCycle: {
              select: { id: true, name: true }
            }
          }
        },
        question: {
          include: {
            category: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    // Check if user is authorized to view this feedback
    if (req.user.role !== 'ADMIN' && feedback.reviewAssignment.reviewerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view this feedback' });
    }

    res.json(feedback);
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update feedback
router.put('/:id', authenticateToken, [
  body('score').isInt({ min: 1, max: 5 }).withMessage('Score must be between 1 and 5'),
  body('comment').optional().custom((value) => {
    if (value === null || value === undefined || typeof value === 'string') {
      return true;
    }
    throw new Error('Comment must be a string or null');
  })
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const feedbackId = parseInt(id);
    const { score, comment } = req.body;

    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId },
      include: {
        reviewAssignment: true
      }
    });

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    // Check if user is authorized to update this feedback
    if (req.user.role !== 'ADMIN' && feedback.reviewAssignment.reviewerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this feedback' });
    }

    const updatedFeedback = await prisma.feedback.update({
      where: { id: feedbackId },
      data: {
        score,
        comment: comment || null
      },
      include: {
        question: {
          include: {
            category: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    res.json({ message: 'Feedback updated successfully', feedback: updatedFeedback });
  } catch (error) {
    console.error('Update feedback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete feedback
router.delete('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const feedbackId = parseInt(id);

    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId },
      include: {
        reviewAssignment: true
      }
    });

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    // Check if user is authorized to delete this feedback
    if (req.user.role !== 'ADMIN' && feedback.reviewAssignment.reviewerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this feedback' });
    }

    await prisma.feedback.delete({
      where: { id: feedbackId }
    });

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

