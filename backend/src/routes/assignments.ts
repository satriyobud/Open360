import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Get all assignments
router.get('/', authenticateToken, async (req: any, res: any) => {
  try {
    const assignments = await query(
      `SELECT ra.*, 
              rc.id as cycle_id_full, rc.name as cycle_name, rc.start_date as cycle_start_date, rc.end_date as cycle_end_date,
              r.id as reviewer_id_full, r.name as reviewer_name, r.email as reviewer_email,
              e.id as reviewee_id_full, e.name as reviewee_name, e.email as reviewee_email
       FROM review_assignments ra
       JOIN review_cycles rc ON ra.review_cycle_id = rc.id
       JOIN users r ON ra.reviewer_id = r.id
       JOIN users e ON ra.reviewee_id = e.id
       ORDER BY ra.created_at DESC`
    ) as any[];

    // Get feedbacks for each assignment
    const assignmentsWithFeedbacks = await Promise.all(
      assignments.map(async (assignment) => {
        const feedbacks = await query(
          `SELECT f.*, q.text as question_text, q.category_id,
                  c.id as category_id_full, c.name as category_name
           FROM feedbacks f
           JOIN questions q ON f.question_id = q.id
           JOIN categories c ON q.category_id = c.id
           WHERE f.review_assignment_id = ?`,
          [assignment.id]
        ) as any[];

        return {
          id: assignment.id,
          reviewCycleId: assignment.review_cycle_id,
          reviewerId: assignment.reviewer_id,
          revieweeId: assignment.reviewee_id,
          relationType: assignment.relation_type,
          createdAt: assignment.created_at,
          updatedAt: assignment.updated_at,
          reviewCycle: {
            id: assignment.cycle_id_full,
            name: assignment.cycle_name,
            startDate: assignment.cycle_start_date,
            endDate: assignment.cycle_end_date
          },
          reviewer: {
            id: assignment.reviewer_id_full,
            name: assignment.reviewer_name,
            email: assignment.reviewer_email
          },
          reviewee: {
            id: assignment.reviewee_id_full,
            name: assignment.reviewee_name,
            email: assignment.reviewee_email
          },
          feedbacks: feedbacks.map(f => ({
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
              category: {
                id: f.category_id_full,
                name: f.category_name
              }
            }
          }))
        };
      })
    );

    res.json(assignmentsWithFeedbacks);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get assignments for current user (as reviewer)
router.get('/my-assignments', authenticateToken, async (req: any, res) => {
  try {
    const assignments = await query(
      `SELECT ra.*, 
              rc.id as cycle_id_full, rc.name as cycle_name, rc.start_date as cycle_start_date, rc.end_date as cycle_end_date,
              e.id as reviewee_id_full, e.name as reviewee_name, e.email as reviewee_email
       FROM review_assignments ra
       JOIN review_cycles rc ON ra.review_cycle_id = rc.id
       JOIN users e ON ra.reviewee_id = e.id
       WHERE ra.reviewer_id = ?
       ORDER BY ra.created_at DESC`,
      [req.user.id]
    ) as any[];

    // Get feedbacks for each assignment
    const assignmentsWithFeedbacks = await Promise.all(
      assignments.map(async (assignment) => {
        const feedbacks = await query(
          `SELECT f.*, q.text as question_text, q.category_id,
                  c.id as category_id_full, c.name as category_name
           FROM feedbacks f
           JOIN questions q ON f.question_id = q.id
           JOIN categories c ON q.category_id = c.id
           WHERE f.review_assignment_id = ?`,
          [assignment.id]
        ) as any[];

        return {
          id: assignment.id,
          reviewCycleId: assignment.review_cycle_id,
          reviewerId: assignment.reviewer_id,
          revieweeId: assignment.reviewee_id,
          relationType: assignment.relation_type,
          createdAt: assignment.created_at,
          updatedAt: assignment.updated_at,
          reviewCycle: {
            id: assignment.cycle_id_full,
            name: assignment.cycle_name,
            startDate: assignment.cycle_start_date,
            endDate: assignment.cycle_end_date
          },
          reviewee: {
            id: assignment.reviewee_id_full,
            name: assignment.reviewee_name,
            email: assignment.reviewee_email
          },
          feedbacks: feedbacks.map(f => ({
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
              category: {
                id: f.category_id_full,
                name: f.category_name
              }
            }
          }))
        };
      })
    );

    res.json(assignmentsWithFeedbacks);
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

    const assignments = await query(
      `SELECT ra.*, 
              rc.id as cycle_id_full, rc.name as cycle_name, rc.start_date as cycle_start_date, rc.end_date as cycle_end_date,
              r.id as reviewer_id_full, r.name as reviewer_name, r.email as reviewer_email,
              e.id as reviewee_id_full, e.name as reviewee_name, e.email as reviewee_email
       FROM review_assignments ra
       JOIN review_cycles rc ON ra.review_cycle_id = rc.id
       JOIN users r ON ra.reviewer_id = r.id
       JOIN users e ON ra.reviewee_id = e.id
       WHERE ra.id = ?`,
      [assignmentId]
    ) as any[];

    if (assignments.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const assignment = assignments[0];

    // Check if the current user is authorized to access this assignment
    if (assignment.reviewer_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'You are not authorized to access this assignment' });
    }

    const feedbacks = await query(
      `SELECT f.*, q.text as question_text, q.category_id,
              c.id as category_id_full, c.name as category_name
       FROM feedbacks f
       JOIN questions q ON f.question_id = q.id
       JOIN categories c ON q.category_id = c.id
       WHERE f.review_assignment_id = ?`,
      [assignmentId]
    ) as any[];

    res.json({
      id: assignment.id,
      reviewCycleId: assignment.review_cycle_id,
      reviewerId: assignment.reviewer_id,
      revieweeId: assignment.reviewee_id,
      relationType: assignment.relation_type,
      createdAt: assignment.created_at,
      updatedAt: assignment.updated_at,
      reviewCycle: {
        id: assignment.cycle_id_full,
        name: assignment.cycle_name,
        startDate: assignment.cycle_start_date,
        endDate: assignment.cycle_end_date
      },
      reviewer: {
        id: assignment.reviewer_id_full,
        name: assignment.reviewer_name,
        email: assignment.reviewer_email
      },
      reviewee: {
        id: assignment.reviewee_id_full,
        name: assignment.reviewee_name,
        email: assignment.reviewee_email
      },
      feedbacks: feedbacks.map(f => ({
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
          category: {
            id: f.category_id_full,
            name: f.category_name
          }
        }
      }))
    });
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
    const cycles = await query(
      'SELECT id FROM review_cycles WHERE id = ?',
      [reviewCycleId]
    ) as any[];

    if (cycles.length === 0) {
      return res.status(404).json({ error: 'Review cycle not found' });
    }

    // Check if reviewer exists
    const reviewers = await query(
      'SELECT id FROM users WHERE id = ?',
      [reviewerId]
    ) as any[];

    if (reviewers.length === 0) {
      return res.status(404).json({ error: 'Reviewer not found' });
    }

    // Check if reviewee exists
    const reviewees = await query(
      'SELECT id FROM users WHERE id = ?',
      [revieweeId]
    ) as any[];

    if (reviewees.length === 0) {
      return res.status(404).json({ error: 'Reviewee not found' });
    }

    // Check if assignment already exists
    const existingAssignments = await query(
      'SELECT id FROM review_assignments WHERE review_cycle_id = ? AND reviewer_id = ? AND reviewee_id = ?',
      [reviewCycleId, reviewerId, revieweeId]
    ) as any[];

    if (existingAssignments.length > 0) {
      return res.status(400).json({ error: 'Assignment already exists' });
    }

    const result = await query(
      `INSERT INTO review_assignments (review_cycle_id, reviewer_id, reviewee_id, relation_type, created_at, updated_at) 
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [reviewCycleId, reviewerId, revieweeId, relationType]
    ) as any;

    const assignmentId = result.insertId;

    // Fetch created assignment with relations
    const assignments = await query(
      `SELECT ra.*, 
              rc.id as cycle_id_full, rc.name as cycle_name, rc.start_date as cycle_start_date, rc.end_date as cycle_end_date,
              r.id as reviewer_id_full, r.name as reviewer_name, r.email as reviewer_email,
              e.id as reviewee_id_full, e.name as reviewee_name, e.email as reviewee_email
       FROM review_assignments ra
       JOIN review_cycles rc ON ra.review_cycle_id = rc.id
       JOIN users r ON ra.reviewer_id = r.id
       JOIN users e ON ra.reviewee_id = e.id
       WHERE ra.id = ?`,
      [assignmentId]
    ) as any[];

    const assignment = assignments[0];

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment: {
        id: assignment.id,
        reviewCycleId: assignment.review_cycle_id,
        reviewerId: assignment.reviewer_id,
        revieweeId: assignment.reviewee_id,
        relationType: assignment.relation_type,
        createdAt: assignment.created_at,
        updatedAt: assignment.updated_at,
        reviewCycle: {
          id: assignment.cycle_id_full,
          name: assignment.cycle_name,
          startDate: assignment.cycle_start_date,
          endDate: assignment.cycle_end_date
        },
        reviewer: {
          id: assignment.reviewer_id_full,
          name: assignment.reviewer_name,
          email: assignment.reviewer_email
        },
        reviewee: {
          id: assignment.reviewee_id_full,
          name: assignment.reviewee_name,
          email: assignment.reviewee_email
        }
      }
    });
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
    const existingAssignments = await query(
      'SELECT id FROM review_assignments WHERE id = ?',
      [assignmentId]
    ) as any[];

    if (existingAssignments.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (relationType) {
      await query(
        'UPDATE review_assignments SET relation_type = ?, updated_at = NOW() WHERE id = ?',
        [relationType, assignmentId]
      );
    }

    // Fetch updated assignment
    const assignments = await query(
      `SELECT ra.*, 
              rc.id as cycle_id_full, rc.name as cycle_name, rc.start_date as cycle_start_date, rc.end_date as cycle_end_date,
              r.id as reviewer_id_full, r.name as reviewer_name, r.email as reviewer_email,
              e.id as reviewee_id_full, e.name as reviewee_name, e.email as reviewee_email
       FROM review_assignments ra
       JOIN review_cycles rc ON ra.review_cycle_id = rc.id
       JOIN users r ON ra.reviewer_id = r.id
       JOIN users e ON ra.reviewee_id = e.id
       WHERE ra.id = ?`,
      [assignmentId]
    ) as any[];

    const assignment = assignments[0];

    res.json({
      message: 'Assignment updated successfully',
      assignment: {
        id: assignment.id,
        reviewCycleId: assignment.review_cycle_id,
        reviewerId: assignment.reviewer_id,
        revieweeId: assignment.reviewee_id,
        relationType: assignment.relation_type,
        createdAt: assignment.created_at,
        updatedAt: assignment.updated_at,
        reviewCycle: {
          id: assignment.cycle_id_full,
          name: assignment.cycle_name,
          startDate: assignment.cycle_start_date,
          endDate: assignment.cycle_end_date
        },
        reviewer: {
          id: assignment.reviewer_id_full,
          name: assignment.reviewer_name,
          email: assignment.reviewer_email
        },
        reviewee: {
          id: assignment.reviewee_id_full,
          name: assignment.reviewee_name,
          email: assignment.reviewee_email
        }
      }
    });
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
    const existingAssignments = await query(
      'SELECT id FROM review_assignments WHERE id = ?',
      [assignmentId]
    ) as any[];

    if (existingAssignments.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    await query('DELETE FROM review_assignments WHERE id = ?', [assignmentId]);

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
