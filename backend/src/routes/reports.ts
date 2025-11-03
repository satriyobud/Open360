import express from 'express';
import { query } from '../config/database';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Reviewer -> Reviewee pairs with overall averages (optionally scoped by cycle)
router.get('/pairs', authenticateToken, requireRole(['ADMIN']), async (req: any, res: any) => {
  try {
    const { reviewCycleId } = req.query;
    const params: any[] = [];
    let where = '';
    if (reviewCycleId) {
      where = 'WHERE ra.review_cycle_id = ?';
      params.push(parseInt(reviewCycleId as string));
    }

    const rows = await query(
      `SELECT 
         ra.reviewer_id, r.name as reviewer_name, r.email as reviewer_email,
         ra.reviewee_id, e.name as reviewee_name, e.email as reviewee_email,
         COUNT(f.id) as total_feedbacks,
         AVG(f.score) as avg_score
       FROM review_assignments ra
       JOIN users r ON ra.reviewer_id = r.id
       JOIN users e ON ra.reviewee_id = e.id
       JOIN feedbacks f ON f.review_assignment_id = ra.id
       ${where}
       GROUP BY ra.reviewer_id, r.name, r.email, ra.reviewee_id, e.name, e.email
       ORDER BY reviewer_name ASC, reviewee_name ASC`,
      params
    ) as any[];

    res.json(rows.map(r => ({
      reviewer: { id: r.reviewer_id, name: r.reviewer_name, email: r.reviewer_email },
      reviewee: { id: r.reviewee_id, name: r.reviewee_name, email: r.reviewee_email },
      totalFeedbacks: Number(r.total_feedbacks || 0),
      averageScore: Number(r.avg_score || 0)
    })));
  } catch (error) {
    console.error('Get pairs summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Category averages for a specific reviewer->reviewee pair (optionally scoped by cycle)
router.get('/pair-categories', authenticateToken, requireRole(['ADMIN']), async (req: any, res: any) => {
  try {
    const { reviewCycleId, reviewerId, revieweeId } = req.query;
    if (!reviewerId || !revieweeId) {
      return res.status(400).json({ error: 'reviewerId and revieweeId are required' });
    }

    const params: any[] = [parseInt(reviewerId as string), parseInt(revieweeId as string)];
    let where = 'WHERE ra.reviewer_id = ? AND ra.reviewee_id = ?';
    if (reviewCycleId) {
      where += ' AND ra.review_cycle_id = ?';
      params.push(parseInt(reviewCycleId as string));
    }

    const rows = await query(
      `SELECT c.id as category_id, c.name as category_name,
              COUNT(f.id) as total_feedbacks,
              AVG(f.score) as avg_score
       FROM review_assignments ra
       JOIN feedbacks f ON f.review_assignment_id = ra.id
       JOIN questions q ON f.question_id = q.id
       JOIN categories c ON q.category_id = c.id
       ${where}
       GROUP BY c.id, c.name
       ORDER BY c.name ASC`,
      params
    ) as any[];

    res.json(rows.map(r => ({
      category: { id: r.category_id, name: r.category_name },
      totalFeedbacks: Number(r.total_feedbacks || 0),
      averageScore: Number(r.avg_score || 0)
    })));
  } catch (error) {
    console.error('Get pair categories summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get aggregated feedback scores by category
router.get('/scores-by-category', authenticateToken, requireRole(['ADMIN']), async (req: any, res: any) => {
  try {
    const { revieweeId, reviewCycleId, relationType } = req.query;

    let sql = `
      SELECT f.*, 
             q.category_id,
             c.id as category_id_full, c.name as category_name, c.description as category_description,
             ra.reviewee_id, ra.review_cycle_id, ra.relation_type,
             e.id as reviewee_id_full, e.name as reviewee_name, e.email as reviewee_email,
             r.id as reviewer_id_full, r.name as reviewer_name, r.email as reviewer_email,
             rc.id as cycle_id_full, rc.name as cycle_name
      FROM feedbacks f
      JOIN questions q ON f.question_id = q.id
      JOIN categories c ON q.category_id = c.id
      JOIN review_assignments ra ON f.review_assignment_id = ra.id
      JOIN users e ON ra.reviewee_id = e.id
      JOIN users r ON ra.reviewer_id = r.id
      JOIN review_cycles rc ON ra.review_cycle_id = rc.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (revieweeId) {
      sql += ' AND ra.reviewee_id = ?';
      params.push(parseInt(revieweeId as string));
    }
    if (reviewCycleId) {
      sql += ' AND ra.review_cycle_id = ?';
      params.push(parseInt(reviewCycleId as string));
    }
    if (relationType) {
      sql += ' AND ra.relation_type = ?';
      params.push(relationType);
    }

    const feedbacks = await query(sql, params) as any[];

    // Group by category and calculate averages
    const categoryScores: any = {};
    
    feedbacks.forEach((f: any) => {
      const categoryName = f.category_name;
      if (!categoryScores[categoryName]) {
        categoryScores[categoryName] = {
          category: {
            id: f.category_id_full,
            name: f.category_name,
            description: f.category_description
          },
          scores: [],
          average: 0,
          totalResponses: 0
        };
      }
      
      categoryScores[categoryName].scores.push(f.score);
      categoryScores[categoryName].totalResponses++;
    });

    // Calculate averages
    Object.keys(categoryScores).forEach(categoryName => {
      const category = categoryScores[categoryName];
      category.average = category.scores.reduce((sum: number, score: number) => sum + score, 0) / category.scores.length;
    });

    res.json(Object.values(categoryScores));
  } catch (error) {
    console.error('Get scores by category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get detailed feedback report
router.get('/detailed', authenticateToken, requireRole(['ADMIN']), async (req: any, res: any) => {
  try {
    const { revieweeId, reviewCycleId } = req.query;

    if (!revieweeId || !reviewCycleId) {
      return res.status(400).json({ error: 'Reviewee ID and Review Cycle ID are required' });
    }

    const feedbacks = await query(
      `SELECT f.*, 
              q.text as question_text, q.category_id,
              c.id as category_id_full, c.name as category_name, c.description as category_description,
              ra.reviewer_id, ra.reviewee_id, ra.review_cycle_id, ra.relation_type,
              r.id as reviewer_id_full, r.name as reviewer_name, r.email as reviewer_email,
              e.id as reviewee_id_full, e.name as reviewee_name, e.email as reviewee_email,
              rc.id as cycle_id_full, rc.name as cycle_name, rc.start_date as cycle_start_date, rc.end_date as cycle_end_date
       FROM feedbacks f
       JOIN questions q ON f.question_id = q.id
       JOIN categories c ON q.category_id = c.id
       JOIN review_assignments ra ON f.review_assignment_id = ra.id
       JOIN users r ON ra.reviewer_id = r.id
       JOIN users e ON ra.reviewee_id = e.id
       JOIN review_cycles rc ON ra.review_cycle_id = rc.id
       WHERE ra.reviewee_id = ? AND ra.review_cycle_id = ?
       ORDER BY c.name ASC, ra.relation_type ASC`,
      [parseInt(revieweeId as string), parseInt(reviewCycleId as string)]
    ) as any[];

    if (feedbacks.length === 0) {
      return res.json({
        reviewee: null,
        reviewCycle: null,
        categories: {}
      });
    }

    // Group by category and relation type
    const report: any = {
      reviewee: {
        id: feedbacks[0].reviewee_id_full,
        name: feedbacks[0].reviewee_name,
        email: feedbacks[0].reviewee_email
      },
      reviewCycle: {
        id: feedbacks[0].cycle_id_full,
        name: feedbacks[0].cycle_name,
        startDate: feedbacks[0].cycle_start_date,
        endDate: feedbacks[0].cycle_end_date
      },
      categories: {}
    };

    feedbacks.forEach((f: any) => {
      const categoryName = f.category_name;
      const relationType = f.relation_type;

      if (!report.categories[categoryName]) {
        report.categories[categoryName] = {
          category: {
            id: f.category_id_full,
            name: f.category_name,
            description: f.category_description
          },
          relations: {}
        };
      }

      if (!report.categories[categoryName].relations[relationType]) {
        report.categories[categoryName].relations[relationType] = {
          relationType,
          feedbacks: [],
          averageScore: 0,
          totalResponses: 0
        };
      }

      report.categories[categoryName].relations[relationType].feedbacks.push({
        question: {
          id: f.question_id,
          text: f.question_text,
          categoryId: f.category_id
        },
        score: f.score,
        comment: f.comment,
        reviewer: {
          id: f.reviewer_id_full,
          name: f.reviewer_name,
          email: f.reviewer_email
        },
        createdAt: f.created_at
      });

      report.categories[categoryName].relations[relationType].totalResponses++;
    });

    // Calculate averages for each relation type
    Object.keys(report.categories).forEach(categoryName => {
      const category = report.categories[categoryName];
      Object.keys(category.relations).forEach(relationType => {
        const relation = category.relations[relationType];
        const totalScore = relation.feedbacks.reduce((sum: number, fb: any) => sum + fb.score, 0);
        relation.averageScore = totalScore / relation.totalResponses;
      });
    });

    res.json(report);
  } catch (error) {
    console.error('Get detailed report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get summary statistics
router.get('/summary', authenticateToken, requireRole(['ADMIN']), async (req: any, res: any) => {
  try {
    const { reviewCycleId } = req.query;

    let assignmentWhere = '';
    let feedbackWhere = '';
    const params: any[] = [];

    if (reviewCycleId) {
      assignmentWhere = 'WHERE review_cycle_id = ?';
      feedbackWhere = `WHERE ra.review_cycle_id = ?`;
      params.push(parseInt(reviewCycleId as string));
    }

    // Total assignments
    const totalAssignmentsResult = await query(
      `SELECT COUNT(*) as count FROM review_assignments ${assignmentWhere}`,
      params
    ) as any[];
    const totalAssignments = Number(totalAssignmentsResult[0]?.count || 0);

    // Completed assignments (those with at least one feedback)
    const completedAssignmentsResult = await query(
      `SELECT COUNT(DISTINCT ra.id) as count
       FROM review_assignments ra
       INNER JOIN feedbacks f ON ra.id = f.review_assignment_id
       ${reviewCycleId ? 'WHERE ra.review_cycle_id = ?' : ''}`,
      reviewCycleId ? [parseInt(reviewCycleId as string)] : []
    ) as any[];
    const completedAssignments = Number(completedAssignmentsResult[0]?.count || 0);

    // Total feedbacks
    const totalFeedbacksResult = await query(
      `SELECT COUNT(*) as count
       FROM feedbacks f
       JOIN review_assignments ra ON f.review_assignment_id = ra.id
       ${feedbackWhere}`,
      params
    ) as any[];
    const totalFeedbacks = Number(totalFeedbacksResult[0]?.count || 0);

    // Average score
    const avgScoreResult = await query(
      `SELECT AVG(score) as avg_score
       FROM feedbacks f
       JOIN review_assignments ra ON f.review_assignment_id = ra.id
       ${feedbackWhere}`,
      params
    ) as any[];
    const averageScore = Number(avgScoreResult[0]?.avg_score || 0);

    // Relation type stats
    const relationTypeStatsResult = await query(
      `SELECT relation_type, COUNT(*) as count
       FROM review_assignments
       ${assignmentWhere}
       GROUP BY relation_type`,
      params
    ) as any[];
    const relationTypeStats = relationTypeStatsResult.map((r: any) => ({
      relationType: r.relation_type,
      count: Number(r.count || 0)
    }));

    // Overall stats
    const totalUsersResult = await query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'EMPLOYEE'"
    ) as any[];
    const totalReviewCyclesResult = await query(
      'SELECT COUNT(*) as count FROM review_cycles'
    ) as any[];
    const totalCategoriesResult = await query(
      'SELECT COUNT(*) as count FROM categories'
    ) as any[];
    const totalQuestionsResult = await query(
      'SELECT COUNT(*) as count FROM questions'
    ) as any[];

    const totalUsers = Number(totalUsersResult[0]?.count || 0);
    const totalReviewCycles = Number(totalReviewCyclesResult[0]?.count || 0);
    const totalCategories = Number(totalCategoriesResult[0]?.count || 0);
    const totalQuestions = Number(totalQuestionsResult[0]?.count || 0);

    const completionRate = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;

    res.json({
      totalAssignments,
      completedAssignments,
      totalFeedbacks,
      averageScore: parseFloat(averageScore.toFixed(2)),
      completionRate: Math.round(completionRate * 100) / 100,
      relationTypeStats,
      overallStats: {
        totalUsers,
        totalReviewCycles,
        totalCategories,
        totalQuestions
      }
    });
  } catch (error) {
    console.error('Get summary statistics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
