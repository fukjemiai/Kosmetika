import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  TextField,
} from '@mui/material';
import { Check, Close, Receipt } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { bookingsApi, billingApi } from '../api/client';

const STATUS_LABELS: Record<string, { label: string; color: any }> = {
  pending: { label: 'Cekajici', color: 'warning' },
  confirmed: { label: 'Potvrzeno', color: 'info' },
  in_progress: { label: 'Probiha', color: 'primary' },
  completed: { label: 'Dokonceno', color: 'success' },
  cancelled: { label: 'Zruseno', color: 'error' },
  no_show: { label: 'Nedostavil se', color: 'default' },
};

const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(dayjs());
  const [dateTo, setDateTo] = useState<Dayjs | null>(dayjs().add(7, 'day'));
  const [statusFilter, setStatusFilter] = useState('');

  const loadBookings = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (dateFrom) params.dateFrom = dateFrom.format('YYYY-MM-DD');
    if (dateTo) params.dateTo = dateTo.format('YYYY-MM-DD') + 'T23:59:59';
    if (statusFilter) params.status = statusFilter;

    bookingsApi
      .list(params)
      .then(setBookings)
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookings();
  }, [dateFrom, dateTo, statusFilter]);

  const handleStatusChange = async (id: string, status: string) => {
    await bookingsApi.update(id, { status });
    loadBookings();
  };

  const handleCreateInvoice = async (bookingId: string) => {
    await billingApi.createFromBooking(bookingId);
    loadBookings();
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Rezervace
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <DatePicker
          label="Od"
          value={dateFrom}
          onChange={setDateFrom}
          slotProps={{ textField: { size: 'small' } }}
        />
        <DatePicker
          label="Do"
          value={dateTo}
          onChange={setDateTo}
          slotProps={{ textField: { size: 'small' } }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">Vse</MenuItem>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <MenuItem key={k} value={k}>{v.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Datum</TableCell>
                <TableCell>Cas</TableCell>
                <TableCell>Zakaznice</TableCell>
                <TableCell>Sluzba</TableCell>
                <TableCell>Kosmeticka</TableCell>
                <TableCell>Cena</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Akce</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>{dayjs(b.startTime).format('DD.MM.YYYY')}</TableCell>
                  <TableCell>
                    {dayjs(b.startTime).format('HH:mm')} - {dayjs(b.endTime).format('HH:mm')}
                  </TableCell>
                  <TableCell>
                    {b.customerName}
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      {b.customerPhone}
                    </Typography>
                  </TableCell>
                  <TableCell>{b.service?.name}</TableCell>
                  <TableCell>
                    {b.beautician?.firstName} {b.beautician?.lastName}
                  </TableCell>
                  <TableCell>{(b.price / 100).toLocaleString('cs-CZ')} Kc</TableCell>
                  <TableCell>
                    <Chip
                      label={STATUS_LABELS[b.status]?.label || b.status}
                      color={STATUS_LABELS[b.status]?.color || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {b.status === 'pending' && (
                      <>
                        <IconButton
                          size="small"
                          color="success"
                          title="Potvrdit"
                          onClick={() => handleStatusChange(b.id, 'confirmed')}
                        >
                          <Check />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          title="Zrusit"
                          onClick={() => handleStatusChange(b.id, 'cancelled')}
                        >
                          <Close />
                        </IconButton>
                      </>
                    )}
                    {b.status === 'confirmed' && (
                      <IconButton
                        size="small"
                        color="success"
                        title="Dokoncit"
                        onClick={() => handleStatusChange(b.id, 'completed')}
                      >
                        <Check />
                      </IconButton>
                    )}
                    {b.status === 'completed' && !b.invoice && (
                      <IconButton
                        size="small"
                        color="primary"
                        title="Vystavit fakturu"
                        onClick={() => handleCreateInvoice(b.id)}
                      >
                        <Receipt />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {bookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Zadne rezervace
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};

export default BookingsPage;
