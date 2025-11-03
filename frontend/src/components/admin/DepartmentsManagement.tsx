import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../../services/api.ts';
import { Add, Edit, Delete } from '@mui/icons-material';
import toast from 'react-hot-toast';

interface Department {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

const DepartmentsManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [name, setName] = useState('');

  const { data: departments = [], isLoading } = useQuery('departments', async () => {
    const res = await api.get('/departments');
    return res.data as Department[];
  });

  const createMutation = useMutation((payload: { name: string }) => api.post('/departments', payload), {
    onSuccess: () => {
      queryClient.invalidateQueries('departments');
      toast.success('Department created');
      handleClose();
    },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Failed to create department')
  });

  const updateMutation = useMutation(({ id, name }: { id: number; name: string }) => api.put(`/departments/${id}`, { name }), {
    onSuccess: () => {
      queryClient.invalidateQueries('departments');
      toast.success('Department updated');
      handleClose();
    },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Failed to update department')
  });

  const deleteMutation = useMutation((id: number) => api.delete(`/departments/${id}`), {
    onSuccess: () => {
      queryClient.invalidateQueries('departments');
      toast.success('Department deleted successfully');
    },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Failed to delete department')
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleOpen = (dept?: Department) => {
    setEditing(dept || null);
    setName(dept?.name || '');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setName('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateMutation.mutate({ id: editing.id, name });
    } else {
      createMutation.mutate({ name });
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 300 },
    {
      field: 'created_at',
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
          Department Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          Add Department
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
          rows={departments}
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
          {editing ? 'Edit Department' : 'Add New Department'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Name"
              fullWidth
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isLoading || updateMutation.isLoading}
            >
              {editing ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default DepartmentsManagement;


