import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  Grid,
  Avatar,
  Divider
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useQuery } from 'react-query';
import { api } from '../../services/api.ts';

const FeedbackManagement: React.FC = () => {
  const { data: feedbacks, isLoading } = useQuery('feedbacks', async () => {
    const response = await api.get('/feedbacks');
    return response.data;
  });

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'reviewer',
      headerName: 'Reviewer',
      width: 200,
      valueGetter: (params) => params.row.reviewAssignment?.reviewer,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
            {params.value?.name?.charAt(0)}
          </Avatar>
          {params.value?.name}
        </Box>
      )
    },
    {
      field: 'reviewee',
      headerName: 'Reviewee',
      width: 200,
      valueGetter: (params) => params.row.reviewAssignment?.reviewee,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
            {params.value?.name?.charAt(0)}
          </Avatar>
          {params.value?.name}
        </Box>
      )
    },
    {
      field: 'question',
      headerName: 'Question',
      width: 300,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" noWrap>
            {params.value?.text}
          </Typography>
          <Chip
            label={params.value?.category?.name}
            size="small"
            color="primary"
            sx={{ mt: 0.5 }}
          />
        </Box>
      )
    },
    {
      field: 'score',
      headerName: 'Score',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={`${params.value}/5`}
          color={params.value >= 4 ? 'success' : params.value >= 3 ? 'warning' : 'error'}
          size="small"
        />
      )
    },
    {
      field: 'comment',
      headerName: 'Comment',
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2" noWrap>
          {params.value || 'No comment'}
        </Typography>
      )
    },
    {
      field: 'createdAt',
      headerName: 'Submitted',
      width: 120,
      renderCell: (params) => new Date(params.value).toLocaleDateString()
    }
  ];

  const getScoreDistribution = () => {
    if (!feedbacks) return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedbacks.forEach((feedback: any) => {
      distribution[feedback.score as keyof typeof distribution]++;
    });
    return distribution;
  };

  const getAverageScore = () => {
    if (!feedbacks || feedbacks.length === 0) return 0;
    const total = feedbacks.reduce((sum: number, feedback: any) => sum + feedback.score, 0);
    return (total / feedbacks.length).toFixed(1);
  };

  const scoreDistribution = getScoreDistribution();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Feedback Management
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
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
                Total Feedbacks
              </Typography>
              <Typography variant="h3" color="primary">
                {feedbacks?.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
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
              <Typography variant="h3" color="success.main">
                {getAverageScore()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
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
                Score Distribution
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {Object.entries(scoreDistribution).map(([score, count]) => (
                  <Chip
                    key={score}
                    label={`${score}: ${count}`}
                    color={parseInt(score) >= 4 ? 'success' : parseInt(score) >= 3 ? 'warning' : 'error'}
                    size="small"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ 
        height: 600, 
        width: '100%',
        '& .MuiDataGrid-root': {
          backgroundColor: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        },
        '& .MuiDataGrid-cell': {
          borderBottom: '1px solid #f0f0f0'
        },
        '& .MuiDataGrid-columnHeaders': {
          backgroundColor: '#f8f9fa',
          borderBottom: '2px solid #e0e0e0'
        },
        '& .MuiDataGrid-row:hover': {
          backgroundColor: '#f8f9fa'
        }
      }}>
        <DataGrid
          rows={feedbacks || []}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 }
            }
          }}
          disableRowSelectionOnClick
        />
      </Box>
    </Box>
  );
};

export default FeedbackManagement;

