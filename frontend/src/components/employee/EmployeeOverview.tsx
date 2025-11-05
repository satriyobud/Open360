import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  LinearProgress
} from '@mui/material';
import {
  Assignment,
  Feedback,
  CheckCircle,
  Pending
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { api } from '../../services/api.ts';

const EmployeeOverview: React.FC = () => {
  const { data: assignments, isLoading } = useQuery('my-assignments', async () => {
    const response = await api.get('/assignments/my-assignments');
    return response.data;
  });

  const { data: user } = useQuery('user-profile', async () => {
    const response = await api.get('/auth/me');
    return response.data;
  });

  if (isLoading) {
    return <LinearProgress />;
  }

  const completedAssignments = assignments?.filter((assignment: any) => 
    assignment.feedbacks && assignment.feedbacks.length > 0
  ) || [];

  const pendingAssignments = assignments?.filter((assignment: any) => 
    !assignment.feedbacks || assignment.feedbacks.length === 0
  ) || [];

  const completionRate = assignments?.length > 0 
    ? (completedAssignments.length / assignments.length) * 100 
    : 0;

  const stats = [
    {
      title: 'Total Assignments',
      value: assignments?.length || 0,
      icon: <Assignment />,
      color: '#1976d2'
    },
    {
      title: 'Completed',
      value: completedAssignments.length,
      icon: <CheckCircle />,
      color: '#388e3c'
    },
    {
      title: 'Pending',
      value: pendingAssignments.length,
      icon: <Pending />,
      color: '#f57c00'
    },
    {
      title: 'Completion Rate',
      value: `${completionRate.toFixed(0)}%`,
      icon: <Feedback />,
      color: '#7b1fa2'
    }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.name}!
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Here's an overview of your feedback assignments and progress.
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
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
      </Grid>

      <Grid container spacing={3}>
        {/* Pending Assignments */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pending Assignments
              </Typography>
              {pendingAssignments.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No pending assignments. Great job!
                </Typography>
              ) : (
                <List>
                  {pendingAssignments.slice(0, 5).map((assignment: any) => (
                    <ListItem key={assignment.id} divider>
                      <ListItemIcon>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {assignment.reviewee.name.charAt(0)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={assignment.reviewee.name}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {assignment.reviewCycle.name}
                            </Typography>
                            <Chip
                              label={assignment.relationType}
                              size="small"
                              color={
                                assignment.relationType === 'SELF' ? 'default' :
                                assignment.relationType === 'MANAGER' ? 'primary' :
                                assignment.relationType === 'PEER' ? 'secondary' : 'success'
                              }
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Completions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Completions
              </Typography>
              {completedAssignments.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No completed assignments yet.
                </Typography>
              ) : (
                <List>
                  {completedAssignments.slice(0, 5).map((assignment: any) => (
                    <ListItem key={assignment.id} divider>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary={assignment.reviewee.name}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {assignment.reviewCycle.name}
                            </Typography>
                            <Typography variant="body2" color="success.main">
                              Completed {new Date(assignment.feedbacks[0]?.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeOverview;

