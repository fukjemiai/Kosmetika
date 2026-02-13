import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  CircularProgress,
} from '@mui/material';
import { LocationOn, Phone, Schedule } from '@mui/icons-material';
import { salonsApi } from '../api/client';

const HomePage: React.FC = () => {
  const [salons, setSalons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    salonsApi
      .list()
      .then(setSalons)
      .catch(() => setSalons([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, color: 'primary.dark' }}>
          Rezervujte si termin
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Vyberte salon a objednejte se online — s uctem i bez nej
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {salons.map((salon) => (
          <Grid item xs={12} sm={6} md={4} key={salon.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" gutterBottom>
                  {salon.name}
                </Typography>
                {salon.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {salon.description}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn fontSize="small" color="action" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">
                    {salon.address}, {salon.city}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Phone fontSize="small" color="action" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">{salon.phone}</Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Chip label="Online rezervace" color="primary" size="small" />
                </Box>
              </CardContent>
              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate(`/salon/${salon.id}`)}
                >
                  Zobrazit nabidku
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {salons.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            Zatim nejsou k dispozici zadne salony
          </Typography>
        </Box>
      )}
    </>
  );
};

export default HomePage;
