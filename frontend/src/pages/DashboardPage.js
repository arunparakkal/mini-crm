import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, CircularProgress, Alert } from '@mui/material';
import { People, CheckCircle, Assignment, Star } from '@mui/icons-material';
import api from '../api/axios';

const StatCard = ({ title, value, icon, color, loading }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{title}</Typography>
          {loading ? <CircularProgress size={28} /> : (
            <Typography variant="h3" sx={{ fontWeight: 800, color }}>{value}</Typography>
          )}
        </Box>
        <Box sx={{ bgcolor: `${color}18`, borderRadius: 2, p: 1.5 }}>
          {React.cloneElement(icon, { sx: { fontSize: 36, color } })}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(({ data }) => setStats(data))
      .catch(() => setError('Failed to load dashboard stats'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#1a237e' }}>Dashboard</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Leads" value={stats?.totalLeads ?? 0} icon={<People />} color="#1a237e" loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Qualified Leads" value={stats?.qualifiedLeads ?? 0} icon={<Star />} color="#f57c00" loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Tasks Due Today" value={stats?.tasksDueToday ?? 0} icon={<Assignment />} color="#d32f2f" loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Completed Tasks" value={stats?.completedTasks ?? 0} icon={<CheckCircle />} color="#388e3c" loading={loading} />
        </Grid>
      </Grid>

      {stats?.leadsByStatus?.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Leads by Status</Typography>
          <Grid container spacing={2}>
            {stats.leadsByStatus.map((s) => (
              <Grid item key={s._id}>
                <Card>
                  <CardContent sx={{ p: 2, textAlign: 'center', minWidth: 120 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{s.count}</Typography>
                    <Typography variant="caption" color="text.secondary">{s._id}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}
