import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database';
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
    const assignments = await query(
      'SELECT id, reviewer_id FROM review_assignments WHERE id = ? AND reviewer_id = ?',
      [reviewAssignmentId, req.user.id]
    ) as any[];

    if (assignments.length === 0) {
      return res.status(404).json({ error: 'Assignment not found or you are not authorized to provide feedback' });
    }

    // Check if question exists
    const questions = await query(
      'SELECT id FROM questions WHERE id = ?',
      [questionId]
    ) as any[];

    if (questions.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Check if feedback already exists for this assignment and question
    const existingFeedbacks = await query(
      'SELECT id FROM feedbacks WHERE review_assignment_id = ? AND question_id = ?',
      [reviewAssignmentId, questionId]
    ) as any[];

    let feedback;
    if (existingFeedbacks.length > 0) {
      // Update existing feedback
      await query(
        'UPDATE feedbacks SET score = ?, comment = ?, updated_at = NOW() WHERE id = ?',
        [score, comment || null, existingFeedbacks[0].id]
      );

      const updatedFeedbacks = await query(
        `SELECT f.*, q.text as question_text, q.category_id,
                c.id as category_id_full, c.name as category_name
         FROM feedbacks f
         JOIN questions q ON f.question_id = q.id
         JOIN categories c ON q.category_id = c.id
         WHERE f.id = ?`,
        [existingFeedbacks[0].id]
      ) as any[];

      feedback = updatedFeedbacks[0];
    } else {
      // Create new feedback
      const result = await query(
        `INSERT INTO feedbacks (review_assignment_id, question_id, score, comment, created_at, updated_at) 
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [reviewAssignmentId, questionId, score, comment || null]
      ) as any;

      const feedbackId = result.insertId;
      const newFeedbacks = await query(
        `SELECT f.*, q.text as question_text, q.category_id,
                c.id as category_id_full, c.name as category_name
         FROM feedbacks f
         JOIN questions q ON f.question_id = q.id
         JOIN categories c ON q.category_id = c.id
         WHERE f.id = ?`,
        [feedbackId]
      ) as any[];

      feedback = newFeedbacks[0];
    }

    res.json({
      message: 'Feedback submitted successfully',
      feedback: {
        id: feedback.id,
        reviewAssignmentId: feedback.review_assignment_id,
        questionId: feedback.question_id,
        score: feedback.score,
        comment: feedback.comment,
        createdAt: feedback.created_at,
        updatedAt: feedback.updated_at,
        question: {
          id: feedback.question_id,
          text: feedback.question_text,
          categoryId: feedback.category_id,
          category: {
            id: feedback.category_id_full,
            name: feedback.category_name
          }
        }
      }
    });
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
    const assignments = await query(
      'SELECT id, reviewer_id FROM review_assignments WHERE id = ? AND reviewer_id = ?',
      [assignId, req.user.id]
    ) as any[];

    if (assignments.length === 0) {
      return res.status(404).json({ error: 'Assignment not found or you are not authorized to view this feedback' });
    }

    const feedbacks = await query(
      `SELECT f.*, q.text as question_text, q.category_id, q.created_at as question_created_at,
              c.id as category_id_full, c.name as category_name
       FROM feedbacks f
       JOIN questions q ON f.question_id = q.id
       JOIN categories c ON q.category_id = c.id
       WHERE f.review_assignment_id = ?
       ORDER BY c.name ASC, q.created_at ASC`,
      [assignId]
    ) as any[];

    res.json(feedbacks.map(f => ({
      id: f.id,
      reviewAssignmentId: f.review_assignment_id,
      questionId: f.question_id,
      score: f.score,
      comment: f.comment,
      createdAt: f.created_at,
      updatedAt: f.updated_at,
      question: {
        id: f.question_id,
        text: f.question_text,
        categoryId: f.category_id,
        createdAt: f.question_created_at,
        category: {
          id: f.category_id_full,
          name: f.category_name
        }
      }
    })));
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

    const feedbacks = await query(
      `SELECT f.*, 
              ra.reviewer_id, ra.reviewee_id, ra.review_cycle_id,
              r.id as reviewer_id_full, r.name as reviewer_name, r.email as reviewer_email,
              e.id as reviewee_id_full, e.name as reviewee_name, e.email as reviewee_email,
              rc.id as cycle_id_full, rc.name as cycle_name,
              q.text as question_text, q.category_id,
              c.id as category_id_full, c.name as category_name
       FROM feedbacks f
       JOIN review_assignments ra ON f.review_assignment_id = ra.id
       JOIN users r ON ra.reviewer_id = r.id
       JOIN users e ON ra.reviewee_id = e.id
       JOIN review_cycles rc ON ra.review_cycle_id = rc.id
       JOIN questions q ON f.question_id = q.id
       JOIN categories c ON q.category_id = c.id
       ORDER BY f.created_at DESC`
    ) as any[];

    res.json(feedbacks.map(f => ({
      id: f.id,
      reviewAssignmentId: f.review_assignment_id,
      questionId: f.question_id,
      score: f.score,
      comment: f.comment,
      createdAt: f.created_at,
      updatedAt: f.updated_at,
      reviewAssignment: {
        id: f.review_assignment_id,
        reviewerId: f.reviewer_id,
        revieweeId: f.reviewee_id,
        reviewCycleId: f.review_cycle_id,
        reviewer: {
          id: f.reviewer_id_full,
          name: f.reviewer_name,
          email: f.reviewer_email
        },
        reviewee: {
          id: f.reviewee_id_full,
          name: f.reviewee_name,
          email: f.reviewee_email
        },
        reviewCycle: {
          id: f.cycle_id_full,
          name: f.cycle_name
        }
      },
      question: {
        id: f.question_id,
        text: f.question_text,
        categoryId: f.category_id,
        category: {
          id: f.category_id_full,
          name: f.category_name
        }
      }
    })));
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

    const feedbacks = await query(
      `SELECT f.*, 
              ra.reviewer_id, ra.reviewee_id, ra.review_cycle_id,
              r.id as reviewer_id_full, r.name as reviewer_name, r.email as reviewer_email,
              e.id as reviewee_id_full, e.name as reviewee_name, e.email as reviewee_email,
              rc.id as cycle_id_full, rc.name as cycle_name,
              q.text as question_text, q.category_id,
              c.id as category_id_full, c.name as category_name
       FROM feedbacks f
       JOIN review_assignments ra ON f.review_assignment_id = ra.id
       JOIN users r ON ra.reviewer_id = r.id
       JOIN users e ON ra.reviewee_id = e.id
       JOIN review_cycles rc ON ra.review_cycle_id = rc.id
       JOIN questions q ON f.question_id = q.id
       JOIN categories c ON q.category_id = c.id
       WHERE f.id = ?`,
      [feedbackId]
    ) as any[];

    if (feedbacks.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    const f = feedbacks[0];

    // Check if user is authorized to view this feedback
    if (req.user.role !== 'ADMIN' && f.reviewer_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view this feedback' });
    }

    res.json({
      id: f.id,
      reviewAssignmentId: f.review_assignment_id,
      questionId: f.question_id,
      score: f.score,
      comment: f.comment,
      createdAt: f.created_at,
      updatedAt: f.updated_at,
      reviewAssignment: {
        id: f.review_assignment_id,
        reviewerId: f.reviewer_id,
        revieweeId: f.reviewee_id,
        reviewCycleId: f.review_cycle_id,
        reviewer: {
          id: f.reviewer_id_full,
          name: f.reviewer_name,
          email: f.reviewer_email
        },
        reviewee: {
          id: f.reviewee_id_full,
          name: f.reviewee_name,
          email: f.reviewee_email
        },
        reviewCycle: {
          id: f.cycle_id_full,
          name: f.cycle_name
        }
      },
      question: {
        id: f.question_id,
        text: f.question_text,
        categoryId: f.category_id,
        category: {
          id: f.category_id_full,
          name: f.category_name
        }
      }
    });
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

    // Get feedback with assignment info
    const feedbacks = await query(
      `SELECT f.*, ra.reviewer_id
       FROM feedbacks f
       JOIN review_assignments ra ON f.review_assignment_id = ra.id
       WHERE f.id = ?`,
      [feedbackId]
    ) as any[];

    if (feedbacks.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    const feedback = feedbacks[0];

    // Check if user is authorized to update this feedback
    if (req.user.role !== 'ADMIN' && feedback.reviewer_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this feedback' });
    }

    await query(
      'UPDATE feedbacks SET score = ?, comment = ?, updated_at = NOW() WHERE id = ?',
      [score, comment || null, feedbackId]
    );

    // Fetch updated feedback
    const updatedFeedbacks = await query(
      `SELECT f.*, q.text as question_text, q.category_id,
              c.id as category_id_full, c.name as category_name
       FROM feedbacks f
       JOIN questions q ON f.question_id = q.id
       JOIN categories c ON q.category_id = c.id
       WHERE f.id = ?`,
      [feedbackId]
    ) as any[];

    const updatedFeedback = updatedFeedbacks[0];

    res.json({
      message: 'Feedback updated successfully',
      feedback: {
        id: updatedFeedback.id,
        reviewAssignmentId: updatedFeedback.review_assignment_id,
        questionId: updatedFeedback.question_id,
        score: updatedFeedback.score,
        comment: updatedFeedback.comment,
        createdAt: updatedFeedback.created_at,
        updatedAt: updatedFeedback.updated_at,
        question: {
          id: updatedFeedback.question_id,
          text: updatedFeedback.question_text,
          categoryId: updatedFeedback.category_id,
          category: {
            id: updatedFeedback.category_id_full,
            name: updatedFeedback.category_name
          }
        }
      }
    });
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

    // Get feedback with assignment info
    const feedbacks = await query(
      `SELECT f.*, ra.reviewer_id
       FROM feedbacks f
       JOIN review_assignments ra ON f.review_assignment_id = ra.id
       WHERE f.id = ?`,
      [feedbackId]
    ) as any[];

    if (feedbacks.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    const feedback = feedbacks[0];

    // Check if user is authorized to delete this feedback
    if (req.user.role !== 'ADMIN' && feedback.reviewer_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this feedback' });
    }

    await query('DELETE FROM feedbacks WHERE id = ?', [feedbackId]);

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
