import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LeadsPage from './pages/LeadsPage';
import LeadFormPage from './pages/LeadFormPage';
import CompaniesPage from './pages/CompaniesPage';
import CompanyDetailPage from './pages/CompanyDetailPage';
import TasksPage from './pages/TasksPage';

const theme = createTheme({
  palette: {
    primary: { main: '#1a237e' },
    secondary: { main: '#00bcd4' },
    background: { default: '#f5f6fa' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: { root: { textTransform: 'none', borderRadius: 8 } }
    },
    MuiCard: {
      styleOverrides: { root: { borderRadius: 12 } }
    },
  },
});

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="leads/new" element={<LeadFormPage />} />
        <Route path="leads/:id/edit" element={<LeadFormPage />} />
        <Route path="companies" element={<CompaniesPage />} />
        <Route path="companies/:id" element={<CompanyDetailPage />} />
        <Route path="tasks" element={<TasksPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
