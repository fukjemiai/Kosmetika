"use client";

import { useState } from "react";
import {
  Typography,
  Card,
  CardContent,
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { StaffLayout } from "@/components/StaffLayout";

const DAYS = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"];

export default function SettingsPage() {
  const [workingHours, setWorkingHours] = useState(
    DAYS.map((_, i) => ({
      dayOfWeek: i,
      startTime: i < 5 ? "09:00" : "",
      endTime: i < 5 ? "17:00" : "",
      enabled: i < 5,
    })),
  );

  return (
    <StaffLayout>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Nastavení
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Pracovní doba
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {workingHours.map((wh, idx) => (
              <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography sx={{ width: 80 }}>{DAYS[idx]}</Typography>
                <TextField
                  type="time"
                  label="Od"
                  value={wh.startTime}
                  onChange={(e) => {
                    const updated = [...workingHours];
                    updated[idx] = { ...updated[idx], startTime: e.target.value, enabled: true };
                    setWorkingHours(updated);
                  }}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  disabled={!wh.enabled}
                  sx={{ width: 130 }}
                />
                <Typography>-</Typography>
                <TextField
                  type="time"
                  label="Do"
                  value={wh.endTime}
                  onChange={(e) => {
                    const updated = [...workingHours];
                    updated[idx] = { ...updated[idx], endTime: e.target.value };
                    setWorkingHours(updated);
                  }}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  disabled={!wh.enabled}
                  sx={{ width: 130 }}
                />
                <Button
                  size="small"
                  variant={wh.enabled ? "outlined" : "text"}
                  color={wh.enabled ? "primary" : "inherit"}
                  onClick={() => {
                    const updated = [...workingHours];
                    updated[idx] = {
                      ...updated[idx],
                      enabled: !updated[idx].enabled,
                      startTime: !updated[idx].enabled ? "09:00" : "",
                      endTime: !updated[idx].enabled ? "17:00" : "",
                    };
                    setWorkingHours(updated);
                  }}
                >
                  {wh.enabled ? "Aktivní" : "Volno"}
                </Button>
              </Box>
            ))}
          </Box>
          <Button variant="contained" sx={{ mt: 3 }}>
            Uložit pracovní dobu
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Fakturační údaje salonu
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Název firmy" fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="IČO" fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="DIČ" fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Email" fullWidth />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Adresa" fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Číslo účtu" fullWidth />
            </Grid>
          </Grid>
          <Button variant="contained" sx={{ mt: 3 }}>
            Uložit
          </Button>
        </CardContent>
      </Card>
    </StaffLayout>
  );
}
