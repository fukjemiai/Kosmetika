import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Avatar,
  Divider,
} from '@mui/material';
import { AccessTime, AttachMoney } from '@mui/icons-material';
import { salonsApi, servicesApi, beauticiansApi } from '../api/client';

const CATEGORY_LABELS: Record<string, string> = {
  face: 'Oblicej',
  body: 'Telo',
  nails: 'Nehty',
  hair: 'Vlasy',
  massage: 'Masaze',
  lashes: 'Rasy',
  brows: 'Oboci',
  makeup: 'Liceni',
  other: 'Ostatni',
};

const SalonPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [salon, setSalon] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [beauticians, setBeauticians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      salonsApi.get(id),
      servicesApi.list(id),
      beauticiansApi.list(id),
    ])
      .then(([s, sv, b]) => {
        setSalon(s);
        setServices(sv);
        setBeauticians(b);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !salon) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const categories = [...new Set(services.map((s) => s.category))];

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {salon.name}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {salon.address}, {salon.city} {salon.zip}
        </Typography>
        {salon.description && (
          <Typography variant="body1" sx={{ mt: 1 }}>
            {salon.description}
          </Typography>
        )}
      </Box>

      <Button
        variant="contained"
        size="large"
        sx={{ mb: 4 }}
        onClick={() => navigate(`/booking/${id}`)}
      >
        Objednat se
      </Button>

      {/* Beauticians */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Nase kosmeticky
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {beauticians.map((b) => (
          <Grid item xs={12} sm={6} md={4} key={b.id}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                  {b.firstName[0]}
                  {b.lastName[0]}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {b.firstName} {b.lastName}
                  </Typography>
                  {b.bio && (
                    <Typography variant="body2" color="text.secondary">
                      {b.bio}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Services by category */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Sluzby
      </Typography>
      {categories.map((cat) => (
        <Box key={cat} sx={{ mb: 3 }}>
          <Chip label={CATEGORY_LABELS[cat] || cat} sx={{ mb: 1 }} />
          <Grid container spacing={2}>
            {services
              .filter((s) => s.category === cat)
              .map((service) => (
                <Grid item xs={12} sm={6} key={service.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {service.name}
                          </Typography>
                          {service.description && (
                            <Typography variant="body2" color="text.secondary">
                              {service.description}
                            </Typography>
                          )}
                        </Box>
                        <Typography variant="h6" color="primary.main" sx={{ whiteSpace: 'nowrap', ml: 2 }}>
                          {(service.price / 100).toLocaleString('cs-CZ')} Kc
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                        <AccessTime fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {service.durationMinutes} min
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Box>
      ))}
    </>
  );
};

export default SalonPage;
