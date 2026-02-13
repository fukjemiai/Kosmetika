import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from '@mui/material';
import { Add, Store, People } from '@mui/icons-material';
import { salonsApi } from '../api/client';

const SalonsPage: React.FC = () => {
  const [salons, setSalons] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    zip: '',
    phone: '',
    email: '',
    description: '',
    openingHours: {},
  });

  useEffect(() => {
    salonsApi.list().then(setSalons).catch(() => {});
  }, []);

  const handleSave = async () => {
    await salonsApi.create(form);
    setDialogOpen(false);
    salonsApi.list().then(setSalons);
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Salony</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
          Novy salon
        </Button>
      </Box>

      <Grid container spacing={3}>
        {salons.map((salon) => (
          <Grid item xs={12} sm={6} md={4} key={salon.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Store color="primary" />
                  <Typography variant="h6">{salon.name}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {salon.address}, {salon.city} {salon.zip}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {salon.phone} &bull; {salon.email}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={salon.active ? 'Aktivni' : 'Neaktivni'}
                    color={salon.active ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Novy salon</DialogTitle>
        <DialogContent>
          <TextField label="Nazev" fullWidth sx={{ mt: 1, mb: 2 }} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Adresa" fullWidth sx={{ mb: 2 }} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField label="Mesto" fullWidth value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <TextField label="PSC" sx={{ width: 150 }} value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} />
          </Box>
          <TextField label="Telefon" fullWidth sx={{ mb: 2 }} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <TextField label="Email" fullWidth sx={{ mb: 2 }} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField label="Popis" fullWidth multiline rows={2} sx={{ mb: 2 }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Zrusit</Button>
          <Button variant="contained" onClick={handleSave}>Vytvorit</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SalonsPage;
