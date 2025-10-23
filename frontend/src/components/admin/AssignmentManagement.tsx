import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../../services/api.ts';
import toast from 'react-hot-toast';

interface Assignment {
  id: number;
  reviewCycle: {
    id: number;
    name: string;
  };
  reviewer: {
    id: number;
    name: string;
    email: string;
  };
  reviewee: {
    id: number;
    name: string;
    email: string;
  };
  relationType: string;
  createdAt: string;
}

const AssignmentManagement: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [formData, setFormData] = useState({
    reviewCycleId: '',
    reviewerId: '',
    revieweeId: '',
    relationType: ''
  });

  const queryClient = useQueryClient();

  const { data: assignments, isLoading } = useQuery('assignments', async () => {
    const response = await api.get('/assignments');
    return response.data;
  });

  const { data: reviewCycles } = useQuery('review-cycles', async () => {
    const response = await api.get('/review-cycles');
    return response.data;
  });

  const { data: employees } = useQuery('employees', async () => {
    const response = await api.get('/employees');
    return response.data;
  });

  const createMutation = useMutation(
    (data: any) => api.post('/assignments', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('assignments');
        toast.success('Assignment created successfully');
        handleClose();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to create assignment');
      }
    }
  );

  const updateMutation = useMutation(
    ({ id, data }: { id: number; data: any }) => api.put(`/assignments/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('assignments');
        toast.success('Assignment updated successfully');
        handleClose();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to update assignment');
      }
    }
  );

  const deleteMutation = useMutation(
    (id: number) => api.delete(`/assignments/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('assignments');
        toast.success('Assignment deleted successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to delete assignment');
      }
    }
  );

  const handleOpen = (assignment?: Assignment) => {
    if (assignment) {
      setEditingAssignment(assignment);
      setFormData({
        reviewCycleId: assignment.reviewCycle.id.toString(),
        reviewerId: assignment.reviewer.id.toString(),
        revieweeId: assignment.reviewee.id.toString(),
        relationType: assignment.relationType
      });
    } else {
      setEditingAssignment(null);
      setFormData({
        reviewCycleId: '',
        reviewerId: '',
        revieweeId: '',
        relationType: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingAssignment(null);
    setFormData({
      reviewCycleId: '',
      reviewerId: '',
      revieweeId: '',
      relationType: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.reviewerId === formData.revieweeId && formData.relationType !== 'SELF') {
      toast.error('Reviewer and reviewee cannot be the same unless relation type is SELF');
      return;
    }

    const submitData = {
      reviewCycleId: parseInt(formData.reviewCycleId),
      reviewerId: parseInt(formData.reviewerId),
      revieweeId: parseInt(formData.revieweeId),
      relationType: formData.relationType
    };

    if (!editingAssignment) {
      createMutation.mutate(submitData);
    } else {
      updateMutation.mutate({ id: editingAssignment.id, data: submitData });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      deleteMutation.mutate(id);
    }
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

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'reviewCycle',
      headerName: 'Review Cycle',
      width: 150,
      renderCell: (params) => params.value?.name
    },
    {
      field: 'reviewer',
      headerName: 'Reviewer',
      width: 200,
      renderCell: (params) => params.value?.name
    },
    {
      field: 'reviewee',
      headerName: 'Reviewee',
      width: 200,
      renderCell: (params) => params.value?.name
    },
    {
      field: 'relationType',
      headerName: 'Relation',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={getRelationTypeColor(params.value)}
        />
      )
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      renderCell: (params) => new Date(params.value).toLocaleDateString()
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Edit />}
          label="Edit"
          onClick={() => handleOpen(params.row)}
        />,
        <GridActionsCellItem
          icon={<Delete />}
          label="Delete"
          onClick={() => handleDelete(params.row.id)}
        />
      ]
    }
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Assignment Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          Add Assignment
        </Button>
      </Box>

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
          rows={assignments || []}
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

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAssignment ? 'Edit Assignment' : 'Add New Assignment'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Review Cycle</InputLabel>
              <Select
                value={formData.reviewCycleId}
                onChange={(e) => setFormData({ ...formData, reviewCycleId: e.target.value })}
                label="Review Cycle"
                required
              >
                {reviewCycles?.map((cycle: any) => (
                  <MenuItem key={cycle.id} value={cycle.id}>
                    {cycle.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Reviewer</InputLabel>
              <Select
                value={formData.reviewerId}
                onChange={(e) => setFormData({ ...formData, reviewerId: e.target.value })}
                label="Reviewer"
                required
              >
                {employees?.map((employee: any) => (
                  <MenuItem key={employee.id} value={employee.id}>
                    {employee.name} ({employee.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Reviewee</InputLabel>
              <Select
                value={formData.revieweeId}
                onChange={(e) => setFormData({ ...formData, revieweeId: e.target.value })}
                label="Reviewee"
                required
              >
                {employees?.map((employee: any) => (
                  <MenuItem key={employee.id} value={employee.id}>
                    {employee.name} ({employee.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Relation Type</InputLabel>
              <Select
                value={formData.relationType}
                onChange={(e) => setFormData({ ...formData, relationType: e.target.value })}
                label="Relation Type"
                required
              >
                <MenuItem value="SELF">Self Assessment</MenuItem>
                <MenuItem value="MANAGER">Manager</MenuItem>
                <MenuItem value="PEER">Peer</MenuItem>
                <MenuItem value="SUBORDINATE">Subordinate</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isLoading || updateMutation.isLoading}
            >
              {editingAssignment ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AssignmentManagement;

