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
  Alert,
  FormControlLabel,
  Checkbox,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox as MuiCheckbox,
  CircularProgress
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
  const [activeStep, setActiveStep] = useState(0);
  const [previewAssignments, setPreviewAssignments] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    config: {
      self: true,
      manager: true,
      subordinate: true,
      peer: true
    }
  });

  const queryClient = useQueryClient();

  const { data: cycles, isLoading } = useQuery('review-cycles', async () => {
    const response = await api.get('/review-cycles');
    return response.data;
  });

  const previewMutation = useMutation(
    (data: any) => api.post('/review-cycles/preview', data),
    {
      onSuccess: (response: any) => {
        const assignments = response.data.previewAssignments || [];
        setPreviewAssignments(assignments);
        setActiveStep(1);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to generate preview');
      }
    }
  );

  const createMutation = useMutation(
    (data: any) => api.post('/review-cycles', data),
    {
      onSuccess: (response: any) => {
        queryClient.invalidateQueries('review-cycles');
        const assignmentsCount = response.data?.assignments_created || 0;
        toast.success(`Review cycle created successfully! ${assignmentsCount} assignments created.`);
        setActiveStep(0);
        setPreviewAssignments([]);
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
        endDate: new Date(cycle.endDate),
        config: (cycle as any).assignmentConfig || {
          self: true,
          manager: true,
          subordinate: true,
          peer: true
        }
      });
    } else {
      setEditingCycle(null);
      setFormData({
        name: '',
        startDate: null,
        endDate: null,
        config: {
          self: true,
          manager: true,
          subordinate: true,
          peer: true
        }
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCycle(null);
    setActiveStep(0);
    setPreviewAssignments([]);
    setFormData({
      name: '',
      startDate: null,
      endDate: null,
      config: {
        self: true,
        manager: true,
        subordinate: true,
        peer: true
      }
    });
  };

  const handleNext = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!formData.name) {
      toast.error('Please enter a cycle name');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    if (formData.startDate >= formData.endDate) {
      toast.error('End date must be after start date');
      return;
    }

    // Validate at least one review type is selected
    if (!formData.config.self && !formData.config.manager && !formData.config.subordinate && !formData.config.peer) {
      toast.error('Please select at least one review type');
      return;
    }

    // If editing, skip preview and submit directly
    if (editingCycle) {
      const submitData = {
        name: formData.name,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        config: formData.config
      };
      updateMutation.mutate({ id: editingCycle.id, data: submitData });
      return;
    }

    // Generate preview
    if (activeStep === 0) {
      previewMutation.mutate({
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        config: formData.config
      });
    }
  };

  const handleBack = () => {
    setActiveStep(0);
  };

  const handleFinalSubmit = () => {
    const selectedAssignments = previewAssignments.filter(a => a.enabled);
    
    const submitData = {
      name: formData.name,
      startDate: formData.startDate!.toISOString(),
      endDate: formData.endDate!.toISOString(),
      config: formData.config,
      assignments: selectedAssignments.map(a => ({
        reviewerId: a.reviewerId,
        revieweeId: a.revieweeId,
        relationType: a.relationType,
        enabled: a.enabled
      }))
    };

    createMutation.mutate(submitData);
  };

  const toggleAssignment = (index: number) => {
    const updated = [...previewAssignments];
    updated[index].enabled = !updated[index].enabled;
    setPreviewAssignments(updated);
  };

  const toggleAllAssignments = () => {
    const allEnabled = previewAssignments.every(a => a.enabled);
    setPreviewAssignments(previewAssignments.map(a => ({ ...a, enabled: !allEnabled })));
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

      <Dialog open={open} onClose={handleClose} maxWidth={activeStep === 1 ? "lg" : "sm"} fullWidth>
        <DialogTitle>
          {editingCycle ? 'Edit Review Cycle' : 'Start New Review Cycle'}
        </DialogTitle>
        <DialogContent sx={{ minHeight: activeStep === 1 ? '500px' : 'auto' }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            <Step>
              <StepLabel>Review Cycle Details</StepLabel>
              <StepContent>
                <form onSubmit={handleNext}>
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

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" gutterBottom sx={{ mb: 1, fontWeight: 'bold' }}>
                    Select Review Types to Auto-Assign:
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                    Choose which types of reviews should be automatically created for each employee
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.config.self}
                          onChange={(e) => setFormData({
                            ...formData,
                            config: { ...formData.config, self: e.target.checked }
                          })}
                        />
                      }
                      label="Self-review (Employees review themselves)"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.config.manager}
                          onChange={(e) => setFormData({
                            ...formData,
                            config: { ...formData.config, manager: e.target.checked }
                          })}
                        />
                      }
                      label="Manager review (Managers review their subordinates)"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.config.subordinate}
                          onChange={(e) => setFormData({
                            ...formData,
                            config: { ...formData.config, subordinate: e.target.checked }
                          })}
                        />
                      }
                      label="Subordinate reviews (Subordinates review their managers)"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.config.peer}
                          onChange={(e) => setFormData({
                            ...formData,
                            config: { ...formData.config, peer: e.target.checked }
                          })}
                        />
                      }
                      label="Peer reviews (Colleagues with the same manager review each other)"
                    />
                  </Box>
                </form>
              </StepContent>
            </Step>

            {!editingCycle && (
              <Step>
                <StepLabel>Preview & Select Assignments</StepLabel>
                <StepContent>
                  {previewMutation.isLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                      <CircularProgress />
                    </Box>
                  ) : previewAssignments.length > 0 ? (
                    <Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Total: {previewAssignments.length} assignments | 
                          Selected: {previewAssignments.filter(a => a.enabled).length}
                        </Typography>
                        <Button
                          size="small"
                          onClick={toggleAllAssignments}
                        >
                          {previewAssignments.every(a => a.enabled) ? 'Deselect All' : 'Select All'}
                        </Button>
                      </Box>
                      <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
                        <Table stickyHeader size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell padding="checkbox" width={50}>
                                <MuiCheckbox
                                  checked={previewAssignments.length > 0 && previewAssignments.every(a => a.enabled)}
                                  indeterminate={previewAssignments.some(a => a.enabled) && !previewAssignments.every(a => a.enabled)}
                                  onChange={toggleAllAssignments}
                                />
                              </TableCell>
                              <TableCell><strong>Reviewer</strong></TableCell>
                              <TableCell><strong>Reviewee</strong></TableCell>
                              <TableCell><strong>Relation Type</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {previewAssignments.map((assignment, index) => (
                              <TableRow key={index} hover>
                                <TableCell padding="checkbox">
                                  <MuiCheckbox
                                    checked={assignment.enabled}
                                    onChange={() => toggleAssignment(index)}
                                  />
                                </TableCell>
                                <TableCell>{assignment.reviewerName} ({assignment.reviewerEmail})</TableCell>
                                <TableCell>{assignment.revieweeName} ({assignment.revieweeEmail})</TableCell>
                                <TableCell>
                                  <Chip 
                                    label={assignment.relationType} 
                                    size="small" 
                                    color={
                                      assignment.relationType === 'SELF' ? 'default' :
                                      assignment.relationType === 'MANAGER' ? 'primary' :
                                      assignment.relationType === 'SUBORDINATE' ? 'secondary' :
                                      'success'
                                    }
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  ) : (
                    <Alert severity="info">
                      No assignments will be created with the selected configuration.
                    </Alert>
                  )}
                </StepContent>
              </Step>
            )}
          </Stepper>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          {activeStep > 0 && !editingCycle && (
            <Button onClick={handleBack}>Back</Button>
          )}
          {activeStep === 0 && (
            <Button
              onClick={handleNext}
              variant="contained"
              disabled={previewMutation.isLoading || createMutation.isLoading || updateMutation.isLoading}
            >
              {editingCycle ? 'Update' : 'Preview Assignments'}
            </Button>
          )}
          {activeStep === 1 && (
            <Button
              onClick={handleFinalSubmit}
              variant="contained"
              disabled={createMutation.isLoading || previewAssignments.filter(a => a.enabled).length === 0}
            >
              {createMutation.isLoading ? 'Creating...' : 'Start Cycle'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewCycleManagement;

