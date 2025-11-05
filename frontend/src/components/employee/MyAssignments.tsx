import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Avatar,
  Alert
} from '@mui/material';
import {
  CheckCircle,
  Pending,
  PlayArrow
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api.ts';

const MyAssignments: React.FC = () => {
  const navigate = useNavigate();
  
  const { data: assignments, isLoading } = useQuery('my-assignments', async () => {
    const response = await api.get('/assignments/my-assignments');
    return response.data;
  });

  const getStatus = (assignment: any) => {
    const hasFeedback = assignment.feedbacks && assignment.feedbacks.length > 0;
    return hasFeedback ? 'completed' : 'pending';
  };

  const getRelationTypeColor = (type: string) => {
    switch (type) {
      case 'SELF': return 'default';
      case 'MANAGER': return 'primary';
      case 'PEER': return 'secondary';
      case 'SUBORDINATE': return 'success';
      default: return 'default';
    }
  };

  const handleStartFeedback = (assignmentId: number) => {
    navigate(`/employee/feedback/${assignmentId}`);
  };

  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  const completedAssignments = assignments?.filter((assignment: any) => 
    getStatus(assignment) === 'completed'
  ) || [];

  const pendingAssignments = assignments?.filter((assignment: any) => 
    getStatus(assignment) === 'pending'
  ) || [];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Assignments
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage your feedback assignments and track your progress.
      </Typography>

      {/* Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h4" color="primary">
                {assignments?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Assignments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h4" color="success.main">
                {completedAssignments.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h4" color="warning.main">
                {pendingAssignments.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h4" color="info.main">
                {assignments?.length > 0 ? Math.round((completedAssignments.length / assignments.length) * 100) : 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completion Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pending Assignments */}
      {pendingAssignments.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Pending Assignments
          </Typography>
          <Grid container spacing={2}>
            {pendingAssignments.map((assignment: any) => (
              <Grid item xs={12} md={6} key={assignment.id}>
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
                      <Avatar sx={{ width: 40, height: 40, mr: 2 }}>
                        {assignment.reviewee.name.charAt(0)}
                      </Avatar>
                      <Box flexGrow={1}>
                        <Typography variant="h6">
                          {assignment.reviewee.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {assignment.reviewCycle.name}
                        </Typography>
                      </Box>
                      <Chip
                        label="Pending"
                        color="warning"
                        icon={<Pending />}
                      />
                    </Box>
                    
                    <Box display="flex" alignItems="center" mb={2}>
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                        Relation:
                      </Typography>
                      <Chip
                        label={assignment.relationType}
                        size="small"
                        color={getRelationTypeColor(assignment.relationType)}
                      />
                    </Box>

                    <Box display="flex" alignItems="center" mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Due: {new Date(assignment.reviewCycle.endDate).toLocaleDateString()}
                      </Typography>
                    </Box>

                    <Button
                      variant="contained"
                      startIcon={<PlayArrow />}
                      onClick={() => handleStartFeedback(assignment.id)}
                      fullWidth
                    >
                      Start Feedback
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Completed Assignments */}
      {completedAssignments.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Completed Assignments
          </Typography>
          <Grid container spacing={2}>
            {completedAssignments.map((assignment: any) => (
              <Grid item xs={12} md={6} key={assignment.id}>
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
                      <Avatar sx={{ width: 40, height: 40, mr: 2 }}>
                        {assignment.reviewee.name.charAt(0)}
                      </Avatar>
                      <Box flexGrow={1}>
                        <Typography variant="h6">
                          {assignment.reviewee.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {assignment.reviewCycle.name}
                        </Typography>
                      </Box>
                      <Chip
                        label="Completed"
                        color="success"
                        icon={<CheckCircle />}
                      />
                    </Box>
                    
                    <Box display="flex" alignItems="center" mb={2}>
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                        Relation:
                      </Typography>
                      <Chip
                        label={assignment.relationType}
                        size="small"
                        color={getRelationTypeColor(assignment.relationType)}
                      />
                    </Box>

                    <Box display="flex" alignItems="center">
                      <Typography variant="body2" color="success.main">
                        Completed on {new Date(assignment.feedbacks[0]?.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* No assignments message */}
      {assignments?.length === 0 && (
        <Alert severity="info">
          You don't have any feedback assignments at the moment. Check back later!
        </Alert>
      )}
    </Box>
  );
};

export default MyAssignments;

