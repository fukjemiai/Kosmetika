"use client";

import { useEffect, useState } from "react";
import {
  Typography,
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import DownloadIcon from "@mui/icons-material/Download";
import { StaffLayout } from "@/components/StaffLayout";
import { StatusChip } from "@kosmetika/ui";

const API_URL = process.env.NEXT_PUBLIC_STAFF_API_URL ?? "http://localhost:3001";

function formatCZK(hellers: number): string {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    minimumFractionDigits: 0,
  }).format(hellers / 100);
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [dateFrom, setDateFrom] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
  );
  const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0]);

  const fetchData = () => {
    fetch(`${API_URL}/api/invoices?from=${dateFrom}&to=${dateTo}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setInvoices)
      .catch(() => setInvoices([]));

    fetch(`${API_URL}/api/invoices/accounting?from=${dateFrom}&to=${dateTo}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setSummary)
      .catch(() => setSummary(null));
  };

  useEffect(fetchData, [dateFrom, dateTo]);

  const exportCSV = () => {
    if (!summary) return;

    const headers = [
      "Číslo faktury",
      "Stav",
      "Zákazník",
      "IČO",
      "DIČ",
      "Základ (CZK)",
      "DPH %",
      "DPH (CZK)",
      "Celkem (CZK)",
      "Vystaveno",
      "Splatnost",
      "Zaplaceno",
      "Salon",
    ];

    const rows = summary.invoices.map((inv: any) => [
      inv.number,
      inv.status,
      inv.customerName,
      inv.customerIco ?? "",
      inv.customerDic ?? "",
      (inv.subtotal / 100).toFixed(2),
      inv.taxRate,
      (inv.taxAmount / 100).toFixed(2),
      (inv.total / 100).toFixed(2),
      new Date(inv.issuedAt).toLocaleDateString("cs-CZ"),
      new Date(inv.dueDate).toLocaleDateString("cs-CZ"),
      inv.paidAt ? new Date(inv.paidAt).toLocaleDateString("cs-CZ") : "",
      inv.salonName,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `faktury_${dateFrom}_${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <StaffLayout>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Fakturace
        </Typography>
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportCSV}>
          Export CSV pro účetní
        </Button>
      </Box>

      {/* Filtry */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          label="Od"
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
        <TextField
          label="Do"
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
      </Box>

      {/* Souhrn */}
      {summary && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">Celkem faktur</Typography>
                <Typography variant="h5" fontWeight={700}>{summary.summary.totalInvoices}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">Zaplaceno</Typography>
                <Typography variant="h5" fontWeight={700} color="success.main">
                  {summary.summary.paidCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">Celková tržba</Typography>
                <Typography variant="h5" fontWeight={700}>
                  {formatCZK(summary.summary.totalRevenue)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">DPH celkem</Typography>
                <Typography variant="h5" fontWeight={700}>
                  {formatCZK(summary.summary.totalTax)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabulka faktur */}
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Číslo</TableCell>
              <TableCell>Zákazník</TableCell>
              <TableCell>Stav</TableCell>
              <TableCell align="right">Základ</TableCell>
              <TableCell align="right">DPH</TableCell>
              <TableCell align="right">Celkem</TableCell>
              <TableCell>Vystaveno</TableCell>
              <TableCell>Splatnost</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((inv: any) => (
              <TableRow key={inv.id} hover>
                <TableCell>{inv.number}</TableCell>
                <TableCell>{inv.customerName}</TableCell>
                <TableCell>
                  <StatusChip status={inv.status} />
                </TableCell>
                <TableCell align="right">{formatCZK(inv.subtotal)}</TableCell>
                <TableCell align="right">{formatCZK(inv.taxAmount)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {formatCZK(inv.total)}
                </TableCell>
                <TableCell>{new Date(inv.issuedAt).toLocaleDateString("cs-CZ")}</TableCell>
                <TableCell>{new Date(inv.dueDate).toLocaleDateString("cs-CZ")}</TableCell>
              </TableRow>
            ))}
            {invoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>
                    Žádné faktury za vybrané období
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </StaffLayout>
  );
}
