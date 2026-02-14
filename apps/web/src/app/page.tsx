"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  InputAdornment,
  AppBar,
  Toolbar,
  Button,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import SearchIcon from "@mui/icons-material/Search";
import { SalonCard } from "@kosmetika/ui";
import type { SalonDto } from "@kosmetika/types";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function HomePage() {
  const router = useRouter();
  const [salons, setSalons] = useState<SalonDto[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/salons`)
      .then((res) => res.json())
      .then(setSalons)
      .catch(console.error);
  }, []);

  const filtered = salons.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <AppBar position="static" color="inherit" elevation={0}>
        <Toolbar>
          <Typography variant="h6" color="primary" fontWeight={700} sx={{ flexGrow: 1 }}>
            Kosmetika
          </Typography>
          <Button href="/auth/signin" variant="outlined" size="small">
            Přihlásit se
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: 8,
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" fontWeight={700} gutterBottom>
            Objednejte se online
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Najděte svůj salon a zarezervujte si termín
          </Typography>
          <TextField
            fullWidth
            placeholder="Hledat salon nebo město..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              maxWidth: 500,
              bgcolor: "white",
              borderRadius: 2,
              "& .MuiOutlinedInput-root": { borderRadius: 2 },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
          Salony
        </Typography>
        <Grid container spacing={3}>
          {filtered.map((salon) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={salon.id}>
              <SalonCard
                name={salon.name}
                description={salon.description}
                address={salon.address}
                city={salon.city}
                phone={salon.phone}
                imageUrl={salon.imageUrl}
                onDetail={() => router.push(`/salons/${salon.id}`)}
              />
            </Grid>
          ))}
        </Grid>

        {filtered.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Žádné salony nenalezeny
            </Typography>
          </Box>
        )}
      </Container>
    </>
  );
}
