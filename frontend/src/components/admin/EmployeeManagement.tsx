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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Alert
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  PersonAdd
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../../services/api.ts';
import toast from 'react-hot-toast';

interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  manager?: {
    id: number;
    name: string;
  };
  department?: {
    id: number;
    name: string;
  };
  subordinates: Array<{
    id: number;
    name: string;
  }>;
  created_at?: string;
}

const EmployeeManagement: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    managerId: '',
    departmentId: ''
  });

  const queryClient = useQueryClient();

  const { data: employees, isLoading } = useQuery('employees', async () => {
    const response = await api.get('/employees');
    return response.data;
  });

  const { data: managers } = useQuery('managers', async () => {
    const response = await api.get('/employees');
    return response.data.filter((emp: Employee) => emp.role === 'EMPLOYEE');
  });

  const { data: departments } = useQuery('departments', async () => {
    const res = await api.get('/departments');
    return res.data;
  });

  const createMutation = useMutation(
    (data: any) => api.post('/employees', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('employees');
        toast.success('Employee created successfully');
        handleClose();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to create employee');
      }
    }
  );

  const updateMutation = useMutation(
    ({ id, data }: { id: number; data: any }) => api.put(`/employees/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('employees');
        toast.success('Employee updated successfully');
        handleClose();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to update employee');
      }
    }
  );

  const deleteMutation = useMutation(
    (id: number) => api.delete(`/employees/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('employees');
        toast.success('Employee deleted successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to delete employee');
      }
    }
  );

  const handleOpen = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        name: employee.name,
        email: employee.email,
        password: '',
        managerId: employee.manager?.id?.toString() || '',
        departmentId: employee.department?.id?.toString() || ''
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        managerId: '',
        departmentId: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingEmployee(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      managerId: '',
      departmentId: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      name: formData.name,
      email: formData.email,
      managerId: formData.managerId ? parseInt(formData.managerId) : null,
      departmentId: formData.departmentId ? parseInt(formData.departmentId) : null
    };

    if (!editingEmployee) {
      submitData.password = formData.password;
      createMutation.mutate(submitData);
    } else {
      updateMutation.mutate({ id: editingEmployee.id, data: submitData });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      deleteMutation.mutate(id);
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    {
      field: 'manager',
      headerName: 'Manager',
      width: 200,
      renderCell: (params) => params.value?.name || 'No Manager'
    },
    {
      field: 'department',
      headerName: 'Department',
      width: 200,
      renderCell: (params) => params.value?.name || '—'
    },
    {
      field: 'subordinates',
      headerName: 'Subordinates',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value?.length || 0}
          size="small"
          color="primary"
        />
      )
    },
    {
      field: 'created_at',
      headerName: 'Created',
      width: 120,
      valueGetter: (params) => params.row.created_at || params.row.createdAt,
      renderCell: (params) => {
        const v = params.value;
        if (!v) return '-';
        const d = new Date(v);
        return isNaN(d.getTime()) ? '-' : d.toLocaleDateString();
      }
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
          Employee Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          Add Employee
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
          rows={employees || []}
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
          {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Name"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            {!editingEmployee && (
              <TextField
                margin="dense"
                label="Password"
                type="password"
                fullWidth
                variant="outlined"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                sx={{ mb: 2 }}
              />
            )}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Manager</InputLabel>
              <Select
                value={formData.managerId}
                onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                label="Manager"
              >
                <MenuItem value="">
                  <em>No Manager</em>
                </MenuItem>
                {managers?.map((manager: Employee) => (
                  <MenuItem key={manager.id} value={manager.id}>
                    {manager.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Department</InputLabel>
              <Select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                label="Department"
              >
                <MenuItem value="">
                  <em>No Department</em>
                </MenuItem>
                {departments?.map((dept: any) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
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
              {editingEmployee ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default EmployeeManagement;

