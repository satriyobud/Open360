import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  People,
  Assessment,
  Feedback,
  TrendingUp,
  Assignment,
  CheckCircle
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { api } from '../../services/api.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';

const DashboardOverview: React.FC = () => {
  const { user } = useAuth();

  const { data: summary, isLoading } = useQuery('dashboard-summary', async () => {
    const response = await api.get('/reports/summary');
    return response.data;
  }, {
    enabled: !!user
  });

  const { data: recentFeedbacks } = useQuery('recent-feedbacks', async () => {
    const response = await api.get('/feedbacks?limit=5');
    return response.data;
  }, {
    enabled: !!user
  });

  const { data: activeCycles } = useQuery('active-cycles', async () => {
    const response = await api.get('/review-cycles');
    return response.data;
  }, {
    enabled: !!user
  });

  if (isLoading) {
    return <LinearProgress />;
  }

  const stats = [
    {
      title: 'Total Employees',
      value: summary?.overallStats?.totalUsers || 0,
      icon: <People />,
      color: '#1976d2'
    },
    {
      title: 'Active Review Cycles',
      value: summary?.overallStats?.totalReviewCycles || 0,
      icon: <Assessment />,
      color: '#388e3c'
    },
    {
      title: 'Total Assignments',
      value: summary?.totalAssignments || 0,
      icon: <Assignment />,
      color: '#f57c00'
    },
    {
      title: 'Completed Assignments',
      value: summary?.completedAssignments || 0,
      icon: <CheckCircle />,
      color: '#7b1fa2'
    },
    {
      title: 'Total Feedback Responses',
      value: summary?.totalFeedbacks || 0,
      icon: <Feedback />,
      color: '#9c27b0'
    }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>
      
      <Grid container spacing={3}>
        {/* Statistics Cards */}
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #e0e0e0',
              '&:hover': {
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: `${stat.color}20`,
                      color: stat.color,
                      mr: 2
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="h4" component="div">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Completion Rate */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            backgroundColor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0',
            '&:hover': {
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)',
              transition: 'all 0.3s ease'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Assignment Completion Rate
              </Typography>
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">
                    {summary?.completedAssignments || 0} of {summary?.totalAssignments || 0} completed
                  </Typography>
                  <Typography variant="body2">
                    {summary?.completionRate || 0}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={summary?.completionRate || 0}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Average Score */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            backgroundColor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0',
            '&:hover': {
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)',
              transition: 'all 0.3s ease'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Average Score
              </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUp sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h3" component="div">
                    {summary?.averageScore?.toFixed(1) || '0.0'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    out of 5.0
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Review Cycles */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            backgroundColor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0',
            '&:hover': {
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)',
              transition: 'all 0.3s ease'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Active Review Cycles
              </Typography>
              <List>
                {activeCycles?.slice(0, 3).map((cycle: any) => (
                  <ListItem key={cycle.id}>
                    <ListItemIcon>
                      <Assessment />
                    </ListItemIcon>
                    <ListItemText
                      primary={cycle.name}
                      secondary={`${new Date(cycle.startDate).toLocaleDateString()} - ${new Date(cycle.endDate).toLocaleDateString()}`}
                    />
                    <Chip
                      label={new Date(cycle.endDate) > new Date() ? 'Active' : 'Ended'}
                      color={new Date(cycle.endDate) > new Date() ? 'success' : 'default'}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Feedbacks */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            backgroundColor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0',
            '&:hover': {
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)',
              transition: 'all 0.3s ease'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Feedbacks
              </Typography>
              <List>
                {recentFeedbacks?.slice(0, 5).map((feedback: any) => (
                  <ListItem key={feedback.id}>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${feedback.reviewAssignment.reviewer.name} → ${feedback.reviewAssignment.reviewee.name}`}
                      secondary={`Score: ${feedback.score}/5 • ${feedback.question.category.name}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardOverview;

