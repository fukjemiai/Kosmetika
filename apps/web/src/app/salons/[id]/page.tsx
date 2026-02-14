"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Grid,
  Box,
  Chip,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import { ServiceCard, LoadingScreen } from "@kosmetika/ui";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function SalonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [salon, setSalon] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;

    Promise.all([
      fetch(`${API_URL}/api/salons/${params.id}`).then((r) => r.json()),
      fetch(`${API_URL}/api/services/salon/${params.id}`).then((r) => r.json()),
    ])
      .then(([salonData, servicesData]) => {
        setSalon(salonData);
        setServices(servicesData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <LoadingScreen />;
  if (!salon) return <Typography>Salon nenalezen</Typography>;

  return (
    <>
      <AppBar position="static" color="inherit" elevation={0}>
        <Toolbar>
          <IconButton edge="start" onClick={() => router.back()} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" color="primary" fontWeight={700} sx={{ flexGrow: 1 }}>
            {salon.name}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Info salonu */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {salon.name}
          </Typography>
          {salon.description && (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {salon.description}
            </Typography>
          )}
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <LocationOnIcon color="action" fontSize="small" />
              <Typography variant="body2">
                {salon.address}, {salon.city} {salon.zip}
              </Typography>
            </Box>
            {salon.phone && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <PhoneIcon color="action" fontSize="small" />
                <Typography variant="body2">{salon.phone}</Typography>
              </Box>
            )}
            {salon.email && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <EmailIcon color="action" fontSize="small" />
                <Typography variant="body2">{salon.email}</Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Kosmetičky */}
        {salon.beauticians?.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
              Naše kosmetičky
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {salon.beauticians.map((bs: any) => (
                <Chip
                  key={bs.beautician.id}
                  avatar={<Avatar>{bs.beautician.firstName[0]}</Avatar>}
                  label={`${bs.beautician.firstName} ${bs.beautician.lastName}`}
                  variant="outlined"
                  onClick={() =>
                    router.push(`/booking?salon=${salon.id}&beautician=${bs.beautician.id}`)
                  }
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Služby */}
        <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
          Služby
        </Typography>
        <Grid container spacing={3}>
          {services.map((ss: any) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={ss.id}>
              <ServiceCard
                name={ss.service.name}
                description={ss.service.description}
                category={ss.service.category}
                price={ss.effectivePrice}
                duration={ss.effectiveDuration}
                onBook={() =>
                  router.push(`/booking?salon=${salon.id}&service=${ss.id}`)
                }
              />
            </Grid>
          ))}
        </Grid>

        {services.length === 0 && (
          <Typography color="text.secondary">
            Zatím nejsou přiřazeny žádné služby.
          </Typography>
        )}
      </Container>
    </>
  );
}
