import express from 'express';
import prisma from '../config/database';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Get aggregated feedback scores by category
router.get('/scores-by-category', authenticateToken, requireRole(['ADMIN']), async (req: any, res: any) => {
  try {
    const { revieweeId, reviewCycleId, relationType } = req.query;

    let whereClause: any = {};

    if (revieweeId) {
      whereClause.reviewAssignment = {
        ...whereClause.reviewAssignment,
        revieweeId: parseInt(revieweeId as string)
      };
    }

    if (reviewCycleId) {
      whereClause.reviewAssignment = {
        ...whereClause.reviewAssignment,
        reviewCycleId: parseInt(reviewCycleId as string)
      };
    }

    if (relationType) {
      whereClause.reviewAssignment = {
        ...whereClause.reviewAssignment,
        relationType: relationType as string
      };
    }

    const feedbacks = await prisma.feedback.findMany({
      where: whereClause,
      include: {
        question: {
          include: {
            category: true
          }
        },
        reviewAssignment: {
          include: {
            reviewee: {
              select: { id: true, name: true, email: true }
            },
            reviewer: {
              select: { id: true, name: true, email: true }
            },
            reviewCycle: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    // Group by category and calculate averages
    const categoryScores: any = {};
    
    feedbacks.forEach(feedback => {
      const categoryName = feedback.question.category.name;
      if (!categoryScores[categoryName]) {
        categoryScores[categoryName] = {
          category: feedback.question.category,
          scores: [],
          average: 0,
          totalResponses: 0
        };
      }
      
      categoryScores[categoryName].scores.push(feedback.score);
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

    const feedbacks = await prisma.feedback.findMany({
      where: {
        reviewAssignment: {
          revieweeId: parseInt(revieweeId as string),
          reviewCycleId: parseInt(reviewCycleId as string)
        }
      },
      include: {
        question: {
          include: {
            category: true
          }
        },
        reviewAssignment: {
          include: {
            reviewer: {
              select: { id: true, name: true, email: true }
            },
            reviewee: {
              select: { id: true, name: true, email: true }
            },
            reviewCycle: {
              select: { id: true, name: true, startDate: true, endDate: true }
            }
          }
        }
      },
      orderBy: [
        { question: { category: { name: 'asc' } } },
        { reviewAssignment: { relationType: 'asc' } }
      ]
    });

    // Group by category and relation type
    const report: any = {
      reviewee: feedbacks[0]?.reviewAssignment.reviewee,
      reviewCycle: feedbacks[0]?.reviewAssignment.reviewCycle,
      categories: {}
    };

    feedbacks.forEach(feedback => {
      const categoryName = feedback.question.category.name;
      const relationType = feedback.reviewAssignment.relationType;

      if (!report.categories[categoryName]) {
        report.categories[categoryName] = {
          category: feedback.question.category,
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
        question: feedback.question,
        score: feedback.score,
        comment: feedback.comment,
        reviewer: feedback.reviewAssignment.reviewer,
        createdAt: feedback.createdAt
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

    let whereClause: any = {};
    if (reviewCycleId) {
      whereClause.reviewAssignment = {
        reviewCycleId: parseInt(reviewCycleId as string)
      };
    }

    const [
      totalAssignments,
      completedAssignments,
      totalFeedbacks,
      averageScore,
      feedbacksByRelation
    ] = await Promise.all([
      prisma.reviewAssignment.count({
        where: reviewCycleId ? { reviewCycleId: parseInt(reviewCycleId as string) } : {}
      }),
      prisma.reviewAssignment.count({
        where: {
          ...(reviewCycleId ? { reviewCycleId: parseInt(reviewCycleId as string) } : {}),
          feedbacks: {
            some: {}
          }
        }
      }),
      prisma.feedback.count({
        where: whereClause
      }),
      prisma.feedback.aggregate({
        where: whereClause,
        _avg: {
          score: true
        }
      }),
      prisma.feedback.groupBy({
        by: ['reviewAssignmentId'],
        where: whereClause,
        _avg: {
          score: true
        }
      })
    ]);

    const relationTypeStats = await prisma.reviewAssignment.groupBy({
      by: ['relationType'],
      where: reviewCycleId ? { reviewCycleId: parseInt(reviewCycleId as string) } : {},
      _count: {
        id: true
      }
    });

    const completionRate = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;

    res.json({
      totalAssignments,
      completedAssignments,
      totalFeedbacks,
      averageScore: averageScore._avg.score || 0,
      completionRate: Math.round(completionRate * 100) / 100,
      relationTypeStats,
      overallStats: {
        totalUsers: await prisma.user.count({ where: { role: 'EMPLOYEE' } }),
        totalReviewCycles: await prisma.reviewCycle.count(),
        totalCategories: await prisma.category.count(),
        totalQuestions: await prisma.question.count()
      }
    });
  } catch (error) {
    console.error('Get summary statistics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

