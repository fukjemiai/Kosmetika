import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { PictureAsPdf, CheckCircle } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { billingApi } from '../api/client';

const STATUS_LABELS: Record<string, { label: string; color: any }> = {
  draft: { label: 'Navrh', color: 'default' },
  issued: { label: 'Vystavena', color: 'info' },
  paid: { label: 'Zaplacena', color: 'success' },
  cancelled: { label: 'Stornovana', color: 'error' },
  overdue: { label: 'Po splatnosti', color: 'warning' },
};

const BillingPage: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(dayjs().startOf('month'));
  const [dateTo, setDateTo] = useState<Dayjs | null>(dayjs().endOf('month'));
  const [statusFilter, setStatusFilter] = useState('');

  const load = () => {
    const params: Record<string, string> = {};
    if (dateFrom) params.dateFrom = dateFrom.format('YYYY-MM-DD');
    if (dateTo) params.dateTo = dateTo.format('YYYY-MM-DD');
    if (statusFilter) params.status = statusFilter;

    billingApi.listInvoices(params).then(setInvoices).catch(() => {});
    billingApi.getSummary(params).then(setSummary).catch(() => {});
  };

  useEffect(() => {
    load();
  }, [dateFrom, dateTo, statusFilter]);

  const handleMarkPaid = async (id: string) => {
    await billingApi.updateInvoice(id, { status: 'paid' });
    load();
  };

  const handleDownloadPdf = async (id: string, invoiceNumber: string) => {
    const blob = await billingApi.downloadPdf(id);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `faktura-${invoiceNumber}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Fakturace
      </Typography>

      {/* Summary cards */}
      {summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">Celkove trzby</Typography>
                <Typography variant="h5">
                  {((summary.totalRevenue || 0) / 100).toLocaleString('cs-CZ')} Kc
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">Zaklad dane</Typography>
                <Typography variant="h5">
                  {((summary.totalSubtotal || 0) / 100).toLocaleString('cs-CZ')} Kc
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">DPH</Typography>
                <Typography variant="h5">
                  {((summary.totalTax || 0) / 100).toLocaleString('cs-CZ')} Kc
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">Nezaplaceno</Typography>
                <Typography variant="h5" color="warning.main">
                  {summary.unpaidCount} faktur
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
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
          <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="">Vse</MenuItem>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <MenuItem key={k} value={k}>{v.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Invoice table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Cislo faktury</TableCell>
              <TableCell>Zakaznik</TableCell>
              <TableCell>Datum vystaveni</TableCell>
              <TableCell>Splatnost</TableCell>
              <TableCell>Castka</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Akce</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell>{inv.invoiceNumber}</TableCell>
                <TableCell>{inv.customerName}</TableCell>
                <TableCell>{dayjs(inv.issuedAt).format('DD.MM.YYYY')}</TableCell>
                <TableCell>{dayjs(inv.dueDate).format('DD.MM.YYYY')}</TableCell>
                <TableCell>{(inv.total / 100).toLocaleString('cs-CZ')} Kc</TableCell>
                <TableCell>
                  <Chip
                    label={STATUS_LABELS[inv.status]?.label || inv.status}
                    color={STATUS_LABELS[inv.status]?.color || 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    title="Stahnout PDF"
                    onClick={() => handleDownloadPdf(inv.id, inv.invoiceNumber)}
                  >
                    <PictureAsPdf />
                  </IconButton>
                  {inv.status === 'issued' && (
                    <IconButton
                      size="small"
                      color="success"
                      title="Oznacit jako zaplacenou"
                      onClick={() => handleMarkPaid(inv.id)}
                    >
                      <CheckCircle />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {invoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Zadne faktury
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default BillingPage;
