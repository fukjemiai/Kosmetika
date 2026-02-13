import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Box, Button, Card, CardContent } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

const BookingConfirmation: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
      <Typography variant="h4" gutterBottom>
        Rezervace potvrzena!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Dekujeme za vasi rezervaci. Potvrzeni jsme odeslali na vas email.
      </Typography>
      <Card variant="outlined" sx={{ maxWidth: 400, mx: 'auto', mb: 4 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            O vasem terminu vas budeme informovat emailem.
            V pripade potreby nas prosim kontaktujte telefonicky.
          </Typography>
        </CardContent>
      </Card>
      <Button variant="contained" onClick={() => navigate('/')}>
        Zpet na hlavni stranku
      </Button>
    </Box>
  );
};

export default BookingConfirmation;
