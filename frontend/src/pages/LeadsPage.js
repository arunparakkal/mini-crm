import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, Select, MenuItem, FormControl,
  InputLabel, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, IconButton, Chip, Pagination, Alert, CircularProgress,
  InputAdornment, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Add, Edit, Delete, Search, Refresh } from '@mui/icons-material';
import api from '../api/axios';

const STATUS_COLORS = {
  New: 'default', Contacted: 'primary', Qualified: 'success', Lost: 'error', Won: 'info'
};

export default function LeadsPage() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/leads', { params: { page, limit: 10, search, status } });
      setLeads(data.leads);
      setTotalPages(data.pages);
    } catch {
      setError('Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/leads/${deleteId}`);
      setDeleteId(null);
      fetchLeads();
    } catch {
      setError('Failed to delete lead');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>Leads</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/leads/new')}
          sx={{ bgcolor: '#1a237e' }}>
          Add Lead
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small" placeholder="Search by name or email" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            sx={{ flex: 1, minWidth: 200 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select value={status} label="Status" onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <MenuItem value="">All</MenuItem>
              {['New', 'Contacted', 'Qualified', 'Lost', 'Won'].map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <IconButton onClick={fetchLeads}><Refresh /></IconButton>
        </Box>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f6fa' }}>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Assigned To</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Company</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell></TableRow>
            ) : leads.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}>No leads found</TableCell></TableRow>
            ) : leads.map((lead) => (
              <TableRow key={lead._id} hover>
                <TableCell sx={{ fontWeight: 500 }}>{lead.name}</TableCell>
                <TableCell>{lead.email}</TableCell>
                <TableCell>
                  <Chip label={lead.status} color={STATUS_COLORS[lead.status] || 'default'} size="small" />
                </TableCell>
                <TableCell>{lead.assignedTo?.name || '—'}</TableCell>
                <TableCell>{lead.company?.name || '—'}</TableCell>
                <TableCell align="center">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => navigate(`/leads/${lead._id}/edit`)} color="primary">
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={() => setDeleteId(lead._id)} color="error">
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" />
        </Box>
      )}

      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this lead? This action cannot be undone.</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
