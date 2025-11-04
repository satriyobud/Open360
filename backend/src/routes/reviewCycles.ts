import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Helper to safely parse JSON from MySQL (string or already-parsed object)
function parseJsonSafe(value: any): any {
  if (!value) return null;
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return value; }
  }
  return value;
}

// Get all review cycles
router.get('/', authenticateToken, async (req: any, res: any) => {
  try {
    const cycles = await query(
      'SELECT * FROM review_cycles ORDER BY created_at DESC'
    ) as any[];

    // Get assignments for each cycle
    const cyclesWithAssignments = await Promise.all(
      cycles.map(async (cycle) => {
        const assignments = await query(
          `SELECT ra.*, 
                  r.id as reviewer_id_full, r.name as reviewer_name, r.email as reviewer_email,
                  e.id as reviewee_id_full, e.name as reviewee_name, e.email as reviewee_email
           FROM review_assignments ra
           JOIN users r ON ra.reviewer_id = r.id
           JOIN users e ON ra.reviewee_id = e.id
           WHERE ra.review_cycle_id = ?`,
          [cycle.id]
        ) as any[];

        return {
          id: cycle.id,
          name: cycle.name,
          startDate: cycle.start_date,
          endDate: cycle.end_date,
          status: cycle.status,
          assignmentConfig: parseJsonSafe(cycle.assignment_config),
          createdAt: cycle.created_at,
          updatedAt: cycle.updated_at,
          assignments: assignments.map(a => ({
            id: a.id,
            reviewCycleId: a.review_cycle_id,
            reviewerId: a.reviewer_id,
            revieweeId: a.reviewee_id,
            relationType: a.relation_type,
            createdAt: a.created_at,
            updatedAt: a.updated_at,
            reviewer: {
              id: a.reviewer_id_full,
              name: a.reviewer_name,
              email: a.reviewer_email
            },
            reviewee: {
              id: a.reviewee_id_full,
              name: a.reviewee_name,
              email: a.reviewee_email
            }
          }))
        };
      })
    );

    res.json(cyclesWithAssignments);
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

    const cycles = await query(
      'SELECT * FROM review_cycles WHERE id = ?',
      [cycleId]
    ) as any[];

    if (cycles.length === 0) {
      return res.status(404).json({ error: 'Review cycle not found' });
    }

    const cycle = cycles[0];
    const assignments = await query(
      `SELECT ra.*, 
              r.id as reviewer_id_full, r.name as reviewer_name, r.email as reviewer_email,
              e.id as reviewee_id_full, e.name as reviewee_name, e.email as reviewee_email
       FROM review_assignments ra
       JOIN users r ON ra.reviewer_id = r.id
       JOIN users e ON ra.reviewee_id = e.id
       WHERE ra.review_cycle_id = ?`,
      [cycleId]
    ) as any[];

    res.json({
      id: cycle.id,
      name: cycle.name,
      startDate: cycle.start_date,
      endDate: cycle.end_date,
      status: cycle.status,
      assignmentConfig: parseJsonSafe(cycle.assignment_config),
      createdAt: cycle.created_at,
      updatedAt: cycle.updated_at,
      assignments: assignments.map(a => ({
        id: a.id,
        reviewCycleId: a.review_cycle_id,
        reviewerId: a.reviewer_id,
        revieweeId: a.reviewee_id,
        relationType: a.relation_type,
        createdAt: a.created_at,
        updatedAt: a.updated_at,
        reviewer: {
          id: a.reviewer_id_full,
          name: a.reviewer_name,
          email: a.reviewer_email
        },
        reviewee: {
          id: a.reviewee_id_full,
          name: a.reviewee_name,
          email: a.reviewee_email
        }
      }))
    });
  } catch (error) {
    console.error('Get review cycle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Preview assignments without creating cycle (Admin only)
router.post('/preview', authenticateToken, requireRole(['ADMIN']), [
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('config').optional().isObject().withMessage('Config must be an object'),
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { startDate, endDate, config } = req.body;

    // Default config if not provided
    const assignmentConfig = config || {
      self: true,
      manager: true,
      subordinate: true,
      peer: true
    };

    // Generate preview assignments (same logic as create, but don't save)
    const previewAssignments: any[] = [];

    // Get all employees (non-admin users) with their details
    const employees = await query(
      `SELECT id, name, email, manager_id FROM users WHERE role = 'EMPLOYEE'`
    ) as any[];

    for (const employee of employees) {
      // Self-review
      if (assignmentConfig.self) {
        previewAssignments.push({
          reviewerId: employee.id,
          reviewerName: employee.name,
          reviewerEmail: employee.email,
          revieweeId: employee.id,
          revieweeName: employee.name,
          revieweeEmail: employee.email,
          relationType: 'SELF',
          enabled: true
        });
      }

      // Manager review
      if (assignmentConfig.manager && employee.manager_id) {
        const managerRows = await query(
          `SELECT id, name, email FROM users WHERE id = ? AND role = 'EMPLOYEE'`,
          [employee.manager_id]
        ) as any[];

        if (managerRows.length > 0) {
          const manager = managerRows[0];
          previewAssignments.push({
            reviewerId: manager.id,
            reviewerName: manager.name,
            reviewerEmail: manager.email,
            revieweeId: employee.id,
            revieweeName: employee.name,
            revieweeEmail: employee.email,
            relationType: 'MANAGER',
            enabled: true
          });
        }
      }

      // Subordinate reviews
      if (assignmentConfig.subordinate) {
        const subordinates = await query(
          `SELECT id, name, email FROM users WHERE manager_id = ? AND role = 'EMPLOYEE'`,
          [employee.id]
        ) as any[];

        for (const subordinate of subordinates) {
          previewAssignments.push({
            reviewerId: subordinate.id,
            reviewerName: subordinate.name,
            reviewerEmail: subordinate.email,
            revieweeId: employee.id,
            revieweeName: employee.name,
            revieweeEmail: employee.email,
            relationType: 'SUBORDINATE',
            enabled: true
          });
        }
      }

      // Peer reviews
      if (assignmentConfig.peer && employee.manager_id) {
        const peers = await query(
          `SELECT id, name, email FROM users WHERE manager_id = ? AND id != ? AND role = ?`,
          [employee.manager_id, employee.id, 'EMPLOYEE']
        ) as any[];

        for (const peer of peers) {
          previewAssignments.push({
            reviewerId: peer.id,
            reviewerName: peer.name,
            reviewerEmail: peer.email,
            revieweeId: employee.id,
            revieweeName: employee.name,
            revieweeEmail: employee.email,
            relationType: 'PEER',
            enabled: true
          });
        }
      }
    }

    res.json({
      previewAssignments,
      totalCount: previewAssignments.length
    });
  } catch (error) {
    console.error('Preview assignments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create review cycle with auto-assignment (Admin only)
router.post('/', authenticateToken, requireRole(['ADMIN']), [
  body('name').notEmpty().withMessage('Name is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('config').optional().isObject().withMessage('Config must be an object'),
  body('config.self').optional().isBoolean().withMessage('Self must be a boolean'),
  body('config.manager').optional().isBoolean().withMessage('Manager must be a boolean'),
  body('config.subordinate').optional().isBoolean().withMessage('Subordinate must be a boolean'),
  body('config.peer').optional().isBoolean().withMessage('Peer must be a boolean'),
  body('assignments').optional().isArray().withMessage('Assignments must be an array')
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, startDate, endDate, config, assignments } = req.body;

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    // Default config if not provided (all enabled)
    const assignmentConfig = config || {
      self: true,
      manager: true,
      subordinate: true,
      peer: true
    };

    // Validate at least one type is enabled
    if (!assignmentConfig.self && !assignmentConfig.manager && !assignmentConfig.subordinate && !assignmentConfig.peer) {
      return res.status(400).json({ error: 'At least one review type must be enabled' });
    }

    // Create review cycle
    const result = await query(
      `INSERT INTO review_cycles (name, start_date, end_date, status, assignment_config, created_at, updated_at) 
       VALUES (?, ?, ?, 'active', ?, NOW(), NOW())`,
      [name, start, end, JSON.stringify(assignmentConfig)]
    ) as any;

    const cycleId = result.insertId;

    let assignmentsCreated = 0;

    // If assignments array is provided, use those (selected from preview)
    if (assignments && Array.isArray(assignments) && assignments.length > 0) {
      for (const assignment of assignments) {
        // Only create if enabled (default true)
        if (assignment.enabled !== false) {
          // Check for duplicates
          const existing = await query(
            'SELECT id FROM review_assignments WHERE review_cycle_id = ? AND reviewer_id = ? AND reviewee_id = ? AND relation_type = ?',
            [cycleId, assignment.reviewerId, assignment.revieweeId, assignment.relationType]
          ) as any[];

          if (existing.length === 0) {
            await query(
              `INSERT INTO review_assignments (review_cycle_id, reviewer_id, reviewee_id, relation_type, created_at, updated_at) 
               VALUES (?, ?, ?, ?, NOW(), NOW())`,
              [cycleId, assignment.reviewerId, assignment.revieweeId, assignment.relationType]
            );
            assignmentsCreated++;
          }
        }
      }
    } else {
      // Otherwise, use auto-assignment logic
      // Get all employees (non-admin users)
      const employees = await query(
        "SELECT id, manager_id FROM users WHERE role = 'EMPLOYEE'"
      ) as any[];

    for (const employee of employees) {
      // Self-review
      if (assignmentConfig.self) {
        const existing = await query(
          'SELECT id FROM review_assignments WHERE review_cycle_id = ? AND reviewer_id = ? AND reviewee_id = ? AND relation_type = ?',
          [cycleId, employee.id, employee.id, 'SELF']
        ) as any[];

        if (existing.length === 0) {
          await query(
            `INSERT INTO review_assignments (review_cycle_id, reviewer_id, reviewee_id, relation_type, created_at, updated_at) 
             VALUES (?, ?, ?, 'SELF', NOW(), NOW())`,
            [cycleId, employee.id, employee.id]
          );
          assignmentsCreated++;
        }
      }

      // Manager review (only when manager exists and is not ADMIN)
      if (assignmentConfig.manager && employee.manager_id) {
        const managerRows = await query(
          "SELECT id FROM users WHERE id = ? AND role = 'EMPLOYEE'",
          [employee.manager_id]
        ) as any[];

        if (managerRows.length > 0) {
          const existing = await query(
            'SELECT id FROM review_assignments WHERE review_cycle_id = ? AND reviewer_id = ? AND reviewee_id = ? AND relation_type = ?',
            [cycleId, employee.manager_id, employee.id, 'MANAGER']
          ) as any[];

          if (existing.length === 0) {
            await query(
              `INSERT INTO review_assignments (review_cycle_id, reviewer_id, reviewee_id, relation_type, created_at, updated_at) 
               VALUES (?, ?, ?, 'MANAGER', NOW(), NOW())`,
              [cycleId, employee.manager_id, employee.id]
            );
            assignmentsCreated++;
          }
        }
      }

      // Subordinate reviews (only for non-admin subordinates)
      if (assignmentConfig.subordinate) {
        const subordinates = await query(
          "SELECT id FROM users WHERE manager_id = ? AND role = 'EMPLOYEE'",
          [employee.id]
        ) as any[];

        for (const subordinate of subordinates) {
          const existing = await query(
            'SELECT id FROM review_assignments WHERE review_cycle_id = ? AND reviewer_id = ? AND reviewee_id = ? AND relation_type = ?',
            [cycleId, subordinate.id, employee.id, 'SUBORDINATE']
          ) as any[];

          if (existing.length === 0) {
            await query(
              `INSERT INTO review_assignments (review_cycle_id, reviewer_id, reviewee_id, relation_type, created_at, updated_at) 
               VALUES (?, ?, ?, 'SUBORDINATE', NOW(), NOW())`,
              [cycleId, subordinate.id, employee.id]
            );
            assignmentsCreated++;
          }
        }
      }

      // Peer reviews (same manager, different person)
      if (assignmentConfig.peer && employee.manager_id) {
        const peers = await query(
          'SELECT id FROM users WHERE manager_id = ? AND id != ? AND role = ?',
          [employee.manager_id, employee.id, 'EMPLOYEE']
        ) as any[];

        for (const peer of peers) {
          const existing = await query(
            'SELECT id FROM review_assignments WHERE review_cycle_id = ? AND reviewer_id = ? AND reviewee_id = ? AND relation_type = ?',
            [cycleId, peer.id, employee.id, 'PEER']
          ) as any[];

          if (existing.length === 0) {
            await query(
              `INSERT INTO review_assignments (review_cycle_id, reviewer_id, reviewee_id, relation_type, created_at, updated_at) 
               VALUES (?, ?, ?, 'PEER', NOW(), NOW())`,
              [cycleId, peer.id, employee.id]
            );
            assignmentsCreated++;
          }
        }
      }
    }

    // Fetch created cycle
    const cycles = await query(
      'SELECT * FROM review_cycles WHERE id = ?',
      [cycleId]
    ) as any[];

    res.status(201).json({
      message: 'Cycle started successfully',
      cycle_id: cycleId,
      assignments_created: assignmentsCreated,
      config: assignmentConfig,
      reviewCycle: {
        id: cycles[0].id,
        name: cycles[0].name,
        startDate: cycles[0].start_date,
        endDate: cycles[0].end_date,
        status: cycles[0].status,
        assignmentConfig: parseJsonSafe(cycles[0].assignment_config),
        createdAt: cycles[0].created_at,
        updatedAt: cycles[0].updated_at
      }
    });
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
    const existingCycles = await query(
      'SELECT id FROM review_cycles WHERE id = ?',
      [cycleId]
    ) as any[];

    if (existingCycles.length === 0) {
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

    // Build update query
    const updates: string[] = [];
    const params: any[] = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (startDate) {
      updates.push('start_date = ?');
      params.push(new Date(startDate));
    }
    if (endDate) {
      updates.push('end_date = ?');
      params.push(new Date(endDate));
    }
    updates.push('updated_at = NOW()');
    params.push(cycleId);

    await query(
      `UPDATE review_cycles SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const cycles = await query(
      'SELECT * FROM review_cycles WHERE id = ?',
      [cycleId]
    ) as any[];

    res.json({
      message: 'Review cycle updated successfully',
      reviewCycle: {
        id: cycles[0].id,
        name: cycles[0].name,
        startDate: cycles[0].start_date,
        endDate: cycles[0].end_date,
        createdAt: cycles[0].created_at,
        updatedAt: cycles[0].updated_at
      }
    });
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
    const existingCycles = await query(
      'SELECT id FROM review_cycles WHERE id = ?',
      [cycleId]
    ) as any[];

    if (existingCycles.length === 0) {
      return res.status(404).json({ error: 'Review cycle not found' });
    }

    // Delete in correct order to handle foreign key constraints
    // 1. Get assignment IDs for this cycle
    const assignments = await query(
      'SELECT id FROM review_assignments WHERE review_cycle_id = ?',
      [cycleId]
    ) as any[];

    // 2. Delete all feedbacks for these assignments
    if (assignments.length > 0) {
      const assignmentIds = assignments.map(a => a.id);
      const placeholders = assignmentIds.map(() => '?').join(',');
      await query(
        `DELETE FROM feedbacks WHERE review_assignment_id IN (${placeholders})`,
        assignmentIds
      );
    }

    // 3. Delete all assignments for this cycle
    await query('DELETE FROM review_assignments WHERE review_cycle_id = ?', [cycleId]);

    // 4. Delete the cycle itself
    await query('DELETE FROM review_cycles WHERE id = ?', [cycleId]);

    res.json({ message: 'Review cycle and all associated data deleted successfully' });
  } catch (error) {
    console.error('Delete review cycle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset all cycles and assignments (Admin only) - Keep questions, categories, users
router.post('/reset', authenticateToken, requireRole(['ADMIN']), async (req: any, res: any) => {
  try {
    // Delete all feedbacks first
    await query('DELETE FROM feedbacks');

    // Delete all assignments
    await query('DELETE FROM review_assignments');

    // Delete all cycles
    await query('DELETE FROM review_cycles');

    res.json({ 
      message: 'All review cycles and assignments have been reset',
      note: 'Questions, categories, and users have been preserved'
    });
  } catch (error) {
    console.error('Reset cycles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
