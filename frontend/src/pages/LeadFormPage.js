import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, TextField, Button,
  Select, MenuItem, FormControl, InputLabel, Alert, CircularProgress, Grid
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import api from '../api/axios';

const STATUSES = ['New', 'Contacted', 'Qualified', 'Lost', 'Won'];

export default function LeadFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({ name: '', email: '', phone: '', status: 'New', assignedTo: '', company: '' });
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/users'), api.get('/companies')]).then(([u, c]) => {
      setUsers(u.data);
      setCompanies(c.data);
    });

    if (isEdit) {
      setFetchLoading(true);
      api.get(`/leads/${id}`)
        .then(({ data }) => {
          setForm({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            status: data.status || 'New',
            assignedTo: data.assignedTo?._id || '',
            company: data.company?._id || '',
          });
        })
        .catch(() => setError('Failed to load lead data'))
        .finally(() => setFetchLoading(false));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email) { setError('Name and email are required'); return; }
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.assignedTo) delete payload.assignedTo;
      if (!payload.company) delete payload.company;

      if (isEdit) {
        await api.put(`/leads/${id}`, payload);
      } else {
        await api.post('/leads', payload);
      }
      navigate('/leads');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save lead');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/leads')} variant="outlined">Back</Button>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>
          {isEdit ? 'Edit Lead' : 'Add Lead'}
        </Typography>
      </Box>

      <Card sx={{ maxWidth: 600, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Name *" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Email *" type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Phone" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select value={form.status} label="Status"
                    onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Assigned To</InputLabel>
                  <Select value={form.assignedTo} label="Assigned To"
                    onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
                    <MenuItem value="">None</MenuItem>
                    {users.map((u) => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Company</InputLabel>
                  <Select value={form.company} label="Company"
                    onChange={(e) => setForm({ ...form, company: e.target.value })}>
                    <MenuItem value="">None</MenuItem>
                    {companies.map((c) => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Button type="submit" variant="contained" startIcon={<Save />} disabled={loading}
                  sx={{ bgcolor: '#1a237e', flex: 1 }}>
                  {loading ? <CircularProgress size={20} color="inherit" /> : (isEdit ? 'Update Lead' : 'Create Lead')}
                </Button>
                <Button variant="outlined" onClick={() => navigate('/leads')}>Cancel</Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
