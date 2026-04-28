import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent, Grid, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress, Alert, Divider
} from '@mui/material';
import { ArrowBack, Business, Email, Phone, Language, LocationOn } from '@mui/icons-material';
import api from '../api/axios';

const STATUS_COLORS = { New: 'default', Contacted: 'primary', Qualified: 'success', Lost: 'error', Won: 'info' };

export default function CompanyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/companies/${id}`)
      .then(({ data }) => setData(data))
      .catch(() => setError('Failed to load company details'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data) return null;

  const { company, leads } = data;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/companies')} variant="outlined">Back</Button>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>{company.name}</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Business color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Company Info</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {[
                { icon: <Business fontSize="small" />, label: 'Industry', value: company.industry },
                { icon: <LocationOn fontSize="small" />, label: 'Location', value: company.location },
                { icon: <Email fontSize="small" />, label: 'Email', value: company.email },
                { icon: <Phone fontSize="small" />, label: 'Phone', value: company.phone },
                { icon: <Language fontSize="small" />, label: 'Website', value: company.website },
              ].filter(item => item.value).map(({ icon, label, value }) => (
                <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Box sx={{ color: 'text.secondary' }}>{icon}</Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                    <Typography variant="body2">{value}</Typography>
                  </Box>
                </Box>
              ))}
              {company.description && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">Description</Typography>
                  <Typography variant="body2">{company.description}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Associated Leads ({leads.length})
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f6fa' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Assigned To</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leads.length === 0 ? (
                      <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3 }}>No leads for this company</TableCell></TableRow>
                    ) : leads.map((lead) => (
                      <TableRow key={lead._id} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{lead.name}</TableCell>
                        <TableCell>{lead.email}</TableCell>
                        <TableCell>
                          <Chip label={lead.status} color={STATUS_COLORS[lead.status] || 'default'} size="small" />
                        </TableCell>
                        <TableCell>{lead.assignedTo?.name || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
