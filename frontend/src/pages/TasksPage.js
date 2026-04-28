import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Alert, CircularProgress, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem,
  FormControl, InputLabel, Grid, IconButton, Tooltip
} from '@mui/material';
import { Add, Delete, CheckCircle } from '@mui/icons-material';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = { Pending: 'warning', 'In Progress': 'info', Completed: 'success' };

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', lead: '', assignedTo: '', dueDate: '', status: 'Pending'
  });

  const fetchTasks = () => {
    setLoading(true);
    api.get('/tasks')
      .then(({ data }) => setTasks(data))
      .catch(() => setError('Failed to load tasks'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTasks();
    api.get('/leads?limit=100').then(({ data }) => setLeads(data.leads));
    api.get('/users').then(({ data }) => setUsers(data));
  }, []);

  const handleCreate = async () => {
    if (!form.title || !form.lead || !form.assignedTo) {
      setError('Title, lead, and assigned user are required');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.dueDate) delete payload.dueDate;
      await api.post('/tasks', payload);
      setOpen(false);
      setForm({ title: '', description: '', lead: '', assignedTo: '', dueDate: '', status: 'Pending' });
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch {
      setError('Failed to delete task');
    }
  };

  const canUpdateStatus = (task) =>
    task.assignedTo?._id === user?._id || user?.role === 'admin';

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>Tasks</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)} sx={{ bgcolor: '#1a237e' }}>
          Add Task
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f6fa' }}>
              <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Lead</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Assigned To</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell></TableRow>
            ) : tasks.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}>No tasks found</TableCell></TableRow>
            ) : tasks.map((task) => (
              <TableRow key={task._id} hover>
                <TableCell sx={{ fontWeight: 500 }}>{task.title}</TableCell>
                <TableCell>{task.lead?.name || '—'}</TableCell>
                <TableCell>{task.assignedTo?.name || '—'}</TableCell>
                <TableCell>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</TableCell>
                <TableCell>
                  <Chip label={task.status} color={STATUS_COLORS[task.status] || 'default'} size="small" />
                </TableCell>
                <TableCell align="center">
                  {canUpdateStatus(task) && task.status !== 'Completed' && (
                    <Tooltip title="Mark as Completed">
                      <IconButton size="small" color="success"
                        onClick={() => handleStatusUpdate(task._id, 'Completed')}>
                        <CheckCircle fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {canUpdateStatus(task) && task.status === 'Pending' && (
                    <Tooltip title="Mark In Progress">
                      <Button size="small" variant="outlined" color="info"
                        onClick={() => handleStatusUpdate(task._id, 'In Progress')}
                        sx={{ ml: 0.5, fontSize: '0.7rem', py: 0.2 }}>
                        Start
                      </Button>
                    </Tooltip>
                  )}
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => handleDelete(task._id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Create Task</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Title *" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={2} label="Description" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Lead *</InputLabel>
                <Select value={form.lead} label="Lead *"
                  onChange={(e) => setForm({ ...form, lead: e.target.value })}>
                  {leads.map((l) => <MenuItem key={l._id} value={l._id}>{l.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Assign To *</InputLabel>
                <Select value={form.assignedTo} label="Assign To *"
                  onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
                  {users.map((u) => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="date" label="Due Date" value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={form.status} label="Status"
                  onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {['Pending', 'In Progress', 'Completed'].map((s) =>
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={saving} sx={{ bgcolor: '#1a237e' }}>
            {saving ? 'Creating...' : 'Create Task'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
