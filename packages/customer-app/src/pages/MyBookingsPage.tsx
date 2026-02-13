import React from 'react';
import { Typography, Box, Alert } from '@mui/material';
import { useAuth } from '../auth/AuthProvider';

const MyBookingsPage: React.FC = () => {
  const { authenticated } = useAuth();

  if (!authenticated) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="info">
          Pro zobrazeni vasich rezervaci se prosim prihlaste.
        </Alert>
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Moje rezervace
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Historie vasich rezervaci bude zobrazena po propojeni s vasim uctem.
      </Typography>
    </>
  );
};

export default MyBookingsPage;
