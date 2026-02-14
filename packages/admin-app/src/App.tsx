import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  Button,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  CalendarMonth,
  Spa,
  People,
  Store,
  Receipt,
  Dashboard,
  Settings,
} from '@mui/icons-material';
import { useAuth } from './auth/AuthProvider';
import DashboardPage from './pages/DashboardPage';
import BookingsPage from './pages/BookingsPage';
import ServicesPage from './pages/ServicesPage';
import CustomersPage from './pages/CustomersPage';
import SalonsPage from './pages/SalonsPage';
import BillingPage from './pages/BillingPage';
import SettingsPage from './pages/SettingsPage';

const DRAWER_WIDTH = 240;

const menuItems = [
  { path: '/', label: 'Prehled', icon: <Dashboard /> },
  { path: '/bookings', label: 'Rezervace', icon: <CalendarMonth /> },
  { path: '/services', label: 'Sluzby', icon: <Spa /> },
  { path: '/customers', label: 'Zakaznice', icon: <People /> },
  { path: '/salons', label: 'Salony', icon: <Store /> },
  { path: '/billing', label: 'Fakturace', icon: <Receipt /> },
  { path: '/settings', label: 'Nastaveni', icon: <Settings /> },
];

const App: React.FC = () => {
  const { authenticated, isInitialized, userName, token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isInitialized) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!authenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Prihlaseni se nezdarilo. Zkuste to prosim znovu.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        <Toolbar>
          <Spa sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="h6" color="primary.main" fontWeight={700}>
            Kosmetika
          </Typography>
        </Toolbar>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.path}
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box sx={{ flexGrow: 1 }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{ bgcolor: 'white', borderBottom: '1px solid #eee' }}
        >
          <Toolbar>
            <Box sx={{ flexGrow: 1 }} />
            <Typography variant="body2" sx={{ mr: 2, color: 'text.secondary' }}>
              {userName}
            </Typography>
            <Button variant="outlined" size="small" onClick={logout}>
              Odhlasit
            </Button>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 3 }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/salons" element={<SalonsPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
};

export default App;
