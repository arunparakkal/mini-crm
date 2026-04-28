import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField,
  Button, Alert, InputAdornment, IconButton, CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Both fields are required'); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #00bcd4 100%)'
    }}>
      <Card sx={{ width: 400, maxWidth: '95vw', borderRadius: 3, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a237e', letterSpacing: 1 }}>
              MINI CRM
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Sign in to your account
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Email" type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              sx={{ mb: 2 }} autoFocus
            />
            <TextField
              fullWidth label="Password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button
              type="submit" fullWidth variant="contained" size="large"
              disabled={loading}
              sx={{ py: 1.5, fontWeight: 700, bgcolor: '#1a237e', '&:hover': { bgcolor: '#283593' } }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
            </Button>
          </Box>

          <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f6fa', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 600, mb: 0.5 }}>
              Demo Credentials
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Register at: POST /api/auth/register
            </Typography>
            
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
