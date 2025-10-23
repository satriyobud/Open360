import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Alert
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  CalendarToday
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../../services/api.ts';
import toast from 'react-hot-toast';

interface ReviewCycle {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

const ReviewCycleManagement: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [editingCycle, setEditingCycle] = useState<ReviewCycle | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    startDate: null as Date | null,
    endDate: null as Date | null
  });

  const queryClient = useQueryClient();

  const { data: cycles, isLoading } = useQuery('review-cycles', async () => {
    const response = await api.get('/review-cycles');
    return response.data;
  });

  const createMutation = useMutation(
    (data: any) => api.post('/review-cycles', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('review-cycles');
        toast.success('Review cycle created successfully');
        handleClose();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to create review cycle');
      }
    }
  );

  const updateMutation = useMutation(
    ({ id, data }: { id: number; data: any }) => api.put(`/review-cycles/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('review-cycles');
        toast.success('Review cycle updated successfully');
        handleClose();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to update review cycle');
      }
    }
  );

  const deleteMutation = useMutation(
    (id: number) => api.delete(`/review-cycles/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('review-cycles');
        toast.success('Review cycle deleted successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to delete review cycle');
      }
    }
  );

  const handleOpen = (cycle?: ReviewCycle) => {
    if (cycle) {
      setEditingCycle(cycle);
      setFormData({
        name: cycle.name,
        startDate: new Date(cycle.startDate),
        endDate: new Date(cycle.endDate)
      });
    } else {
      setEditingCycle(null);
      setFormData({
        name: '',
        startDate: null,
        endDate: null
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCycle(null);
    setFormData({
      name: '',
      startDate: null,
      endDate: null
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.startDate || !formData.endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    if (formData.startDate >= formData.endDate) {
      toast.error('End date must be after start date');
      return;
    }

    const submitData = {
      name: formData.name,
      startDate: formData.startDate.toISOString(),
      endDate: formData.endDate.toISOString()
    };

    if (!editingCycle) {
      createMutation.mutate(submitData);
    } else {
      updateMutation.mutate({ id: editingCycle.id, data: submitData });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this review cycle?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return { label: 'Upcoming', color: 'default' as const };
    if (now > end) return { label: 'Ended', color: 'error' as const };
    return { label: 'Active', color: 'success' as const };
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 200 },
    {
      field: 'startDate',
      headerName: 'Start Date',
      width: 120,
      renderCell: (params) => new Date(params.value).toLocaleDateString()
    },
    {
      field: 'endDate',
      headerName: 'End Date',
      width: 120,
      renderCell: (params) => new Date(params.value).toLocaleDateString()
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const status = getStatus(params.row.startDate, params.row.endDate);
        return <Chip label={status.label} color={status.color} size="small" />;
      }
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
          Review Cycle Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          Add Review Cycle
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
          rows={cycles || []}
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
          {editingCycle ? 'Edit Review Cycle' : 'Add New Review Cycle'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Cycle Name"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              sx={{ mb: 2 }}
              placeholder="e.g., Q4 2024 Performance Review"
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box display="flex" gap={2} mb={2}>
                <DatePicker
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(date) => setFormData({ ...formData, startDate: date })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
                <DatePicker
                  label="End Date"
                  value={formData.endDate}
                  onChange={(date) => setFormData({ ...formData, endDate: date })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Box>
            </LocalizationProvider>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isLoading || updateMutation.isLoading}
            >
              {editingCycle ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ReviewCycleManagement;

