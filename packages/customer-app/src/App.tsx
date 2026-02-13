import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import { Spa as SpaIcon } from '@mui/icons-material';
import { useAuth } from './auth/AuthProvider';
import HomePage from './pages/HomePage';
import SalonPage from './pages/SalonPage';
import BookingPage from './pages/BookingPage';
import BookingConfirmation from './pages/BookingConfirmation';
import MyBookingsPage from './pages/MyBookingsPage';

const App: React.FC = () => {
  const { authenticated, userName, login, logout } = useAuth();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #eee' }}>
        <Toolbar>
          <SpaIcon sx={{ color: 'primary.main', mr: 1 }} />
          <Typography
            variant="h6"
            component="a"
            href="/"
            sx={{ flexGrow: 1, color: 'primary.main', textDecoration: 'none' }}
          >
            Kosmetika
          </Typography>
          {authenticated ? (
            <>
              <Button href="/my-bookings" sx={{ mr: 1 }}>
                Moje rezervace
              </Button>
              <Typography variant="body2" sx={{ mr: 2, color: 'text.secondary' }}>
                {userName}
              </Typography>
              <Button variant="outlined" size="small" onClick={logout}>
                Odhlasit
              </Button>
            </>
          ) : (
            <Button variant="outlined" size="small" onClick={login}>
              Prihlasit se
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/salon/:id" element={<SalonPage />} />
          <Route path="/booking/:salonId" element={<BookingPage />} />
          <Route path="/booking/confirmation/:id" element={<BookingConfirmation />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
        </Routes>
      </Container>
    </Box>
  );
};

export default App;
