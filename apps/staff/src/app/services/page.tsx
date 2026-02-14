"use client";

import { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import AddIcon from "@mui/icons-material/Add";
import { StaffLayout } from "@/components/StaffLayout";
import { ServiceCard } from "@kosmetika/ui";

const API_URL = process.env.NEXT_PUBLIC_STAFF_API_URL ?? "http://localhost:3001";

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    defaultPrice: "",
    defaultDuration: "",
  });

  const fetchServices = () => {
    fetch(`${API_URL}/api/services`)
      .then((r) => r.json())
      .then(setServices)
      .catch(() => setServices([]));
  };

  useEffect(fetchServices, []);

  const handleCreate = async () => {
    await fetch(`${API_URL}/api/services`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description || undefined,
        category: form.category || undefined,
        defaultPrice: Math.round(parseFloat(form.defaultPrice) * 100),
        defaultDuration: parseInt(form.defaultDuration, 10),
      }),
    });
    setDialogOpen(false);
    setForm({ name: "", description: "", category: "", defaultPrice: "", defaultDuration: "" });
    fetchServices();
  };

  return (
    <StaffLayout>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Služby
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Přidat službu
        </Button>
      </Box>

      <Grid container spacing={3}>
        {services.map((service: any) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={service.id}>
            <ServiceCard
              name={service.name}
              description={service.description}
              category={service.category}
              price={service.defaultPrice}
              duration={service.defaultDuration}
            />
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nová služba</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Název služby"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <TextField
              label="Popis"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              multiline
              rows={2}
            />
            <TextField
              label="Kategorie"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <TextField
              label="Cena (CZK)"
              type="number"
              value={form.defaultPrice}
              onChange={(e) => setForm({ ...form, defaultPrice: e.target.value })}
              required
            />
            <TextField
              label="Trvání (minuty)"
              type="number"
              value={form.defaultDuration}
              onChange={(e) => setForm({ ...form, defaultDuration: e.target.value })}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Zrušit</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!form.name || !form.defaultPrice || !form.defaultDuration}
          >
            Vytvořit
          </Button>
        </DialogActions>
      </Dialog>
    </StaffLayout>
  );
}
