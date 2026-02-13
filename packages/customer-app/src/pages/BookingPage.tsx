import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { useAuth } from '../auth/AuthProvider';
import { servicesApi, beauticiansApi, bookingsApi } from '../api/client';

const steps = ['Sluzba', 'Kosmeticka', 'Termin', 'Udaje'];

const BookingPage: React.FC = () => {
  const { salonId } = useParams<{ salonId: string }>();
  const navigate = useNavigate();
  const { authenticated, userName, keycloak } = useAuth();

  const [activeStep, setActiveStep] = useState(0);
  const [services, setServices] = useState<any[]>([]);
  const [beauticians, setBeauticians] = useState<any[]>([]);
  const [slots, setSlots] = useState<{ start: string; end: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Selections
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedBeautician, setSelectedBeautician] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs().add(1, 'day'));
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!salonId) return;
    servicesApi.list(salonId).then(setServices);
    beauticiansApi.list(salonId).then(setBeauticians);
  }, [salonId]);

  // Pre-fill from Keycloak
  useEffect(() => {
    if (authenticated && keycloak?.tokenParsed) {
      setCustomerForm((prev) => ({
        ...prev,
        name: `${keycloak.tokenParsed!.given_name || ''} ${keycloak.tokenParsed!.family_name || ''}`.trim(),
        email: keycloak.tokenParsed!.email || '',
      }));
    }
  }, [authenticated, keycloak]);

  // Load slots when date changes
  useEffect(() => {
    if (!selectedBeautician || !selectedService || !selectedDate || !salonId) return;
    setLoading(true);
    setSelectedSlot(null);
    bookingsApi
      .getAvailability(
        selectedBeautician.id,
        salonId,
        selectedService.id,
        selectedDate.format('YYYY-MM-DD'),
      )
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  }, [selectedBeautician, selectedService, selectedDate, salonId]);

  const handleSubmit = async () => {
    if (!selectedService || !selectedBeautician || !selectedSlot || !salonId) return;
    setError('');
    setLoading(true);

    try {
      const booking = await bookingsApi.create({
        customerName: customerForm.name,
        customerEmail: customerForm.email,
        customerPhone: customerForm.phone,
        beauticianId: selectedBeautician.id,
        salonId,
        serviceId: selectedService.id,
        startTime: selectedSlot,
        notes: customerForm.notes || undefined,
      });
      navigate(`/booking/confirmation/${booking.id}`);
    } catch (e: any) {
      setError(e.message || 'Chyba pri vytvareni rezervace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Rezervace
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step 0: Select service */}
      {activeStep === 0 && (
        <Grid container spacing={2}>
          {services.map((service) => (
            <Grid item xs={12} sm={6} key={service.id}>
              <Card
                variant={selectedService?.id === service.id ? 'elevation' : 'outlined'}
                sx={{
                  cursor: 'pointer',
                  border: selectedService?.id === service.id ? '2px solid' : undefined,
                  borderColor: 'primary.main',
                }}
                onClick={() => setSelectedService(service)}
              >
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {service.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {service.durationMinutes} min &bull;{' '}
                    {(service.price / 100).toLocaleString('cs-CZ')} Kc
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button
              variant="contained"
              disabled={!selectedService}
              onClick={() => setActiveStep(1)}
            >
              Pokracovat
            </Button>
          </Grid>
        </Grid>
      )}

      {/* Step 1: Select beautician */}
      {activeStep === 1 && (
        <Grid container spacing={2}>
          {beauticians.map((b) => (
            <Grid item xs={12} sm={6} md={4} key={b.id}>
              <Card
                variant={selectedBeautician?.id === b.id ? 'elevation' : 'outlined'}
                sx={{
                  cursor: 'pointer',
                  border: selectedBeautician?.id === b.id ? '2px solid' : undefined,
                  borderColor: 'primary.main',
                }}
                onClick={() => setSelectedBeautician(b)}
              >
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {b.firstName} {b.lastName}
                  </Typography>
                  {b.bio && (
                    <Typography variant="body2" color="text.secondary">
                      {b.bio}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button sx={{ mr: 1 }} onClick={() => setActiveStep(0)}>
              Zpet
            </Button>
            <Button
              variant="contained"
              disabled={!selectedBeautician}
              onClick={() => setActiveStep(2)}
            >
              Pokracovat
            </Button>
          </Grid>
        </Grid>
      )}

      {/* Step 2: Select date and time */}
      {activeStep === 2 && (
        <Box>
          <Box sx={{ mb: 3 }}>
            <DatePicker
              label="Vyberte datum"
              value={selectedDate}
              onChange={setSelectedDate}
              disablePast
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Box>

          {loading ? (
            <CircularProgress />
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {slots.map((slot) => {
                const time = dayjs(slot.start).format('HH:mm');
                return (
                  <Chip
                    key={slot.start}
                    label={time}
                    color={selectedSlot === slot.start ? 'primary' : 'default'}
                    variant={selectedSlot === slot.start ? 'filled' : 'outlined'}
                    onClick={() => setSelectedSlot(slot.start)}
                    sx={{ fontSize: '1rem', py: 2, px: 1 }}
                  />
                );
              })}
              {slots.length === 0 && !loading && (
                <Typography color="text.secondary">
                  Zadne volne terminy pro tento den
                </Typography>
              )}
            </Box>
          )}

          <Button sx={{ mr: 1 }} onClick={() => setActiveStep(1)}>
            Zpet
          </Button>
          <Button
            variant="contained"
            disabled={!selectedSlot}
            onClick={() => setActiveStep(3)}
          >
            Pokracovat
          </Button>
        </Box>
      )}

      {/* Step 3: Customer details */}
      {activeStep === 3 && (
        <Box sx={{ maxWidth: 500 }}>
          {!authenticated && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Muzete se objednat bez prihlaseni, nebo se{' '}
              <Button size="small" onClick={() => {}}>
                prihlaste
              </Button>{' '}
              pro ukladani historie.
            </Alert>
          )}

          <TextField
            label="Jmeno a prijmeni"
            fullWidth
            required
            sx={{ mb: 2 }}
            value={customerForm.name}
            onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            sx={{ mb: 2 }}
            value={customerForm.email}
            onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
          />
          <TextField
            label="Telefon"
            fullWidth
            required
            sx={{ mb: 2 }}
            value={customerForm.phone}
            onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
          />
          <TextField
            label="Poznamka (volitelne)"
            fullWidth
            multiline
            rows={3}
            sx={{ mb: 2 }}
            value={customerForm.notes}
            onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })}
          />

          {/* Summary */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Shrnutí
              </Typography>
              <Typography>
                <strong>Sluzba:</strong> {selectedService?.name}
              </Typography>
              <Typography>
                <strong>Kosmeticka:</strong> {selectedBeautician?.firstName}{' '}
                {selectedBeautician?.lastName}
              </Typography>
              <Typography>
                <strong>Datum:</strong> {selectedDate?.format('DD.MM.YYYY')}
              </Typography>
              <Typography>
                <strong>Cas:</strong> {selectedSlot ? dayjs(selectedSlot).format('HH:mm') : ''}
              </Typography>
              <Typography>
                <strong>Cena:</strong>{' '}
                {selectedService ? (selectedService.price / 100).toLocaleString('cs-CZ') : 0} Kc
              </Typography>
            </CardContent>
          </Card>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Button sx={{ mr: 1 }} onClick={() => setActiveStep(2)}>
            Zpet
          </Button>
          <Button
            variant="contained"
            disabled={!customerForm.name || !customerForm.email || !customerForm.phone || loading}
            onClick={handleSubmit}
          >
            {loading ? <CircularProgress size={24} /> : 'Potvrdit rezervaci'}
          </Button>
        </Box>
      )}
    </>
  );
};

export default BookingPage;
