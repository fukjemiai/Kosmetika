import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { servicesApi } from '../api/client';

const CATEGORIES = [
  { value: 'face', label: 'Oblicej' },
  { value: 'body', label: 'Telo' },
  { value: 'nails', label: 'Nehty' },
  { value: 'hair', label: 'Vlasy' },
  { value: 'massage', label: 'Masaze' },
  { value: 'lashes', label: 'Rasy' },
  { value: 'brows', label: 'Oboci' },
  { value: 'makeup', label: 'Liceni' },
  { value: 'other', label: 'Ostatni' },
];

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'face',
    durationMinutes: 60,
    price: 0,
    salonId: '',
  });

  const loadServices = () => {
    servicesApi.list().then(setServices).catch(() => {});
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleOpen = (service?: any) => {
    if (service) {
      setEditing(service);
      setForm({
        name: service.name,
        description: service.description || '',
        category: service.category,
        durationMinutes: service.durationMinutes,
        price: service.price / 100,
        salonId: service.salonId,
      });
    } else {
      setEditing(null);
      setForm({ name: '', description: '', category: 'face', durationMinutes: 60, price: 0, salonId: '' });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const data = { ...form, price: Math.round(form.price * 100) };
    if (editing) {
      await servicesApi.update(editing.id, data);
    } else {
      await servicesApi.create(data);
    }
    setDialogOpen(false);
    loadServices();
  };

  const handleDelete = async (id: string) => {
    await servicesApi.remove(id);
    loadServices();
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Sluzby</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Nova sluzba
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nazev</TableCell>
              <TableCell>Kategorie</TableCell>
              <TableCell>Doba</TableCell>
              <TableCell>Cena</TableCell>
              <TableCell>Akce</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  {s.name}
                  {s.description && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      {s.description}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={CATEGORIES.find((c) => c.value === s.category)?.label || s.category}
                    size="small"
                  />
                </TableCell>
                <TableCell>{s.durationMinutes} min</TableCell>
                <TableCell>{(s.price / 100).toLocaleString('cs-CZ')} Kc</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleOpen(s)}>
                    <Edit />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(s.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Upravit sluzbu' : 'Nova sluzba'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Nazev"
            fullWidth
            sx={{ mt: 1, mb: 2 }}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="Popis"
            fullWidth
            multiline
            rows={2}
            sx={{ mb: 2 }}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Kategorie</InputLabel>
            <Select
              value={form.category}
              label="Kategorie"
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Doba trvani (min)"
            type="number"
            fullWidth
            sx={{ mb: 2 }}
            value={form.durationMinutes}
            onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 0 })}
          />
          <TextField
            label="Cena (Kc)"
            type="number"
            fullWidth
            sx={{ mb: 2 }}
            value={form.price}
            onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Zrusit</Button>
          <Button variant="contained" onClick={handleSave}>Ulozit</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ServicesPage;
