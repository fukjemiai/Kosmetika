"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Chip,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { LoadingScreen } from "@kosmetika/ui";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const STEPS = ["Služba", "Kosmetička a termín", "Vaše údaje", "Potvrzení"];

export default function BookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeStep, setActiveStep] = useState(0);
  const [salon, setSalon] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [beauticians, setBeauticians] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Výběr
  const [selectedService, setSelectedService] = useState<string>(searchParams.get("service") ?? "");
  const [selectedBeautician, setSelectedBeautician] = useState<string>(searchParams.get("beautician") ?? "");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  // Údaje zákazníka
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [note, setNote] = useState("");

  // Výsledek
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [error, setError] = useState("");

  const salonId = searchParams.get("salon") ?? "";

  useEffect(() => {
    if (!salonId) return;
    Promise.all([
      fetch(`${API_URL}/api/salons/${salonId}`).then((r) => r.json()),
      fetch(`${API_URL}/api/services/salon/${salonId}`).then((r) => r.json()),
      fetch(`${API_URL}/api/beauticians?salonId=${salonId}`).then((r) => r.json()),
    ])
      .then(([s, svcs, bs]) => {
        setSalon(s);
        setServices(svcs);
        setBeauticians(bs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [salonId]);

  // Načíst sloty po výběru kosmetičky a data
  useEffect(() => {
    if (!selectedBeautician || !salonId || !selectedDate) return;

    const svc = services.find((s) => s.id === selectedService);
    const duration = svc?.effectiveDuration ?? 60;

    fetch(
      `${API_URL}/api/availability/${selectedBeautician}/${salonId}/slots?date=${selectedDate}&duration=${duration}`,
    )
      .then((r) => r.json())
      .then(setSlots)
      .catch(console.error);
  }, [selectedBeautician, salonId, selectedDate, selectedService, services]);

  const handleBook = async () => {
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salonId,
          beauticianId: selectedBeautician,
          salonServiceId: selectedService,
          guestName: guestName || undefined,
          guestEmail: guestEmail || undefined,
          guestPhone: guestPhone || undefined,
          startTime: selectedSlot,
          note: note || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? "Chyba při vytváření rezervace");
      }

      const result = await res.json();
      setBookingResult(result);
      setActiveStep(3);
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <>
      <AppBar position="static" color="inherit" elevation={0}>
        <Toolbar>
          <IconButton edge="start" onClick={() => router.back()} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" color="primary" fontWeight={700}>
            Rezervace - {salon?.name}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Krok 1: Výběr služby */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Vyberte službu
            </Typography>
            <Grid container spacing={2}>
              {services.map((ss) => (
                <Grid size={{ xs: 12, sm: 6 }} key={ss.id}>
                  <Card
                    sx={{
                      cursor: "pointer",
                      border: selectedService === ss.id ? 2 : 0,
                      borderColor: "primary.main",
                    }}
                    onClick={() => setSelectedService(ss.id)}
                  >
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {ss.service.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {ss.effectiveDuration} min -{" "}
                        {new Intl.NumberFormat("cs-CZ", {
                          style: "currency",
                          currency: "CZK",
                          minimumFractionDigits: 0,
                        }).format(ss.effectivePrice / 100)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                disabled={!selectedService}
                onClick={() => setActiveStep(1)}
              >
                Pokračovat
              </Button>
            </Box>
          </Box>
        )}

        {/* Krok 2: Kosmetička a termín */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Vyberte kosmetičku
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
              {beauticians.map((b: any) => (
                <Chip
                  key={b.id}
                  label={`${b.firstName} ${b.lastName}`}
                  color={selectedBeautician === b.id ? "primary" : "default"}
                  onClick={() => setSelectedBeautician(b.id)}
                  variant={selectedBeautician === b.id ? "filled" : "outlined"}
                />
              ))}
            </Box>

            {selectedBeautician && (
              <>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Vyberte datum
                </Typography>
                <TextField
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  inputProps={{ min: new Date().toISOString().split("T")[0] }}
                  sx={{ mb: 3 }}
                />

                <Typography variant="h6" sx={{ mb: 2 }}>
                  Dostupné termíny
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {slots
                    .filter((s) => s.available)
                    .map((slot) => {
                      const time = new Date(slot.startTime).toLocaleTimeString("cs-CZ", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      return (
                        <Chip
                          key={slot.startTime}
                          label={time}
                          color={selectedSlot === slot.startTime ? "primary" : "default"}
                          onClick={() => setSelectedSlot(slot.startTime)}
                          variant={selectedSlot === slot.startTime ? "filled" : "outlined"}
                        />
                      );
                    })}
                  {slots.filter((s) => s.available).length === 0 && (
                    <Typography color="text.secondary">
                      Žádné volné termíny v tento den
                    </Typography>
                  )}
                </Box>
              </>
            )}

            <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
              <Button onClick={() => setActiveStep(0)}>Zpět</Button>
              <Button
                variant="contained"
                disabled={!selectedBeautician || !selectedSlot}
                onClick={() => setActiveStep(2)}
              >
                Pokračovat
              </Button>
            </Box>
          </Box>
        )}

        {/* Krok 3: Údaje zákazníka */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Vaše údaje
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Můžete se objednat i bez registrace. Stačí vyplnit kontaktní údaje.
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 400 }}>
              <TextField
                label="Jméno a příjmení"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
              />
              <TextField
                label="Email"
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                required
              />
              <TextField
                label="Telefon"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
              />
              <TextField
                label="Poznámka"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                multiline
                rows={3}
              />
            </Box>
            <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
              <Button onClick={() => setActiveStep(1)}>Zpět</Button>
              <Button
                variant="contained"
                disabled={!guestName || !guestEmail}
                onClick={handleBook}
              >
                Potvrdit rezervaci
              </Button>
            </Box>
          </Box>
        )}

        {/* Krok 4: Potvrzení */}
        {activeStep === 3 && bookingResult && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h4" color="primary" fontWeight={700} gutterBottom>
              Rezervace vytvořena!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Vaše rezervace byla úspěšně vytvořena. Na email {guestEmail} obdržíte potvrzení.
            </Typography>
            <Card sx={{ maxWidth: 400, mx: "auto", textAlign: "left" }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Salon
                </Typography>
                <Typography sx={{ mb: 1 }}>{bookingResult.salon?.name}</Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Služba
                </Typography>
                <Typography sx={{ mb: 1 }}>
                  {bookingResult.salonService?.service?.name}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Kosmetička
                </Typography>
                <Typography sx={{ mb: 1 }}>
                  {bookingResult.beautician?.firstName} {bookingResult.beautician?.lastName}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Termín
                </Typography>
                <Typography>
                  {new Date(bookingResult.startTime).toLocaleString("cs-CZ")}
                </Typography>
              </CardContent>
            </Card>
            <Button variant="contained" sx={{ mt: 3 }} onClick={() => router.push("/")}>
              Zpět na hlavní stránku
            </Button>
          </Box>
        )}
      </Container>
    </>
  );
}
