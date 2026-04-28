import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, IconButton, Avatar,
  Menu, MenuItem, Divider, useTheme, useMediaQuery
} from '@mui/material';
import {
  Dashboard, People, Business, Assignment, Menu as MenuIcon,
  Logout, Person, ChevronLeft
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 240;

const navItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/' },
  { text: 'Leads', icon: <People />, path: '/leads' },
  { text: 'Companies', icon: <Business />, path: '/companies' },
  { text: 'Tasks', icon: <Assignment />, path: '/tasks' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => { logout(); navigate('/login'); };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#1a237e' }}>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, letterSpacing: 1 }}>
          Mini CRM
        </Typography>
        {isMobile && (
          <IconButton onClick={() => setMobileOpen(false)} sx={{ color: 'white' }}>
            <ChevronLeft />
          </IconButton>
        )}
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />
      <List sx={{ flex: 1, pt: 1 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={() => isMobile && setMobileOpen(false)}
                sx={{
                  mx: 1, borderRadius: 2, mb: 0.5,
                  bgcolor: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                }}
              >
                <ListItemIcon sx={{ color: active ? '#fff' : 'rgba(255,255,255,0.7)', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{ '& .MuiListItemText-primary': { color: active ? '#fff' : 'rgba(255,255,255,0.7)', fontWeight: active ? 600 : 400 } }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      {!isMobile ? (
        <Drawer variant="permanent" sx={{ width: DRAWER_WIDTH, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none' } }}>
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
        >
          {drawer}
        </Drawer>
      )}

      {/* Main content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
          <Toolbar>
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)} sx={{ mr: 1, color: '#1a237e' }}>
                <MenuIcon />
              </IconButton>
            )}
            <Box sx={{ flex: 1 }} />
            <Typography variant="body2" sx={{ mr: 1, color: '#555' }}>{user?.name}</Typography>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ bgcolor: '#1a237e', width: 36, height: 36, fontSize: 14 }}>
                {user?.name?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem disabled><Person fontSize="small" sx={{ mr: 1 }} />{user?.email}</MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}><Logout fontSize="small" sx={{ mr: 1 }} />Logout</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Box sx={{ flex: 1, p: 3, bgcolor: '#f5f6fa', overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
