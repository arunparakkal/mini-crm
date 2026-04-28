import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Alert, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, IconButton, Tooltip
} from '@mui/material';
import { Add, Visibility, Delete } from '@mui/icons-material';
import api from '../api/axios';

export default function CompaniesPage() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', industry: '', location: '', website: '', phone: '', email: '' });
  const [saving, setSaving] = useState(false);

  const fetchCompanies = () => {
    setLoading(true);
    api.get('/companies')
      .then(({ data }) => setCompanies(data))
      .catch(() => setError('Failed to load companies'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCompanies(); }, []);

  const handleCreate = async () => {
    if (!form.name) { setError('Company name is required'); return; }
    setSaving(true);
    try {
      await api.post('/companies', form);
      setOpen(false);
      setForm({ name: '', industry: '', location: '', website: '', phone: '', email: '' });
      fetchCompanies();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create company');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this company?')) return;
    try {
      await api.delete(`/companies/${id}`);
      fetchCompanies();
    } catch {
      setError('Failed to delete company');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>Companies</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)} sx={{ bgcolor: '#1a237e' }}>
          Add Company
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f6fa' }}>
              <TableCell sx={{ fontWeight: 700 }}>Company Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Industry</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell></TableRow>
            ) : companies.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}>No companies found</TableCell></TableRow>
            ) : companies.map((c) => (
              <TableRow key={c._id} hover>
                <TableCell sx={{ fontWeight: 500 }}>{c.name}</TableCell>
                <TableCell>{c.industry || '—'}</TableCell>
                <TableCell>{c.location || '—'}</TableCell>
                <TableCell>{c.email || '—'}</TableCell>
                <TableCell align="center">
                  <Tooltip title="View Details">
                    <IconButton size="small" onClick={() => navigate(`/companies/${c._id}`)} color="primary">
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={() => handleDelete(c._id)} color="error">
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
        <DialogTitle sx={{ fontWeight: 700 }}>Add Company</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {[
              { label: 'Company Name *', key: 'name' },
              { label: 'Industry', key: 'industry' },
              { label: 'Location', key: 'location' },
              { label: 'Website', key: 'website' },
              { label: 'Phone', key: 'phone' },
              { label: 'Email', key: 'email' },
            ].map(({ label, key }) => (
              <Grid item xs={12} sm={6} key={key}>
                <TextField fullWidth size="small" label={label} value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={saving} sx={{ bgcolor: '#1a237e' }}>
            {saving ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
