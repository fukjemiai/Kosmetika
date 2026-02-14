"use client";

import { useEffect, useState } from "react";
import {
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { StaffLayout } from "@/components/StaffLayout";
import { StatusChip } from "@kosmetika/ui";

const API_URL = process.env.NEXT_PUBLIC_STAFF_API_URL ?? "http://localhost:3001";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split("T")[0]);
  const [dateTo, setDateTo] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
  );
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const fetchBookings = () => {
    const params = new URLSearchParams();
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);
    if (statusFilter) params.set("status", statusFilter);

    fetch(`${API_URL}/api/bookings?${params}`)
      .then((r) => {
        if (r.ok) return r.json();
        return [];
      })
      .then(setBookings)
      .catch(() => setBookings([]));
  };

  useEffect(fetchBookings, [dateFrom, dateTo, statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`${API_URL}/api/bookings/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchBookings();
    setSelectedBooking(null);
  };

  return (
    <StaffLayout>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Rezervace
      </Typography>

      {/* Filtry */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
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
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">Všechny</MenuItem>
            <MenuItem value="PENDING">Čekající</MenuItem>
            <MenuItem value="CONFIRMED">Potvrzené</MenuItem>
            <MenuItem value="IN_PROGRESS">Probíhající</MenuItem>
            <MenuItem value="COMPLETED">Dokončené</MenuItem>
            <MenuItem value="CANCELLED">Zrušené</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Seznam rezervací */}
      <Grid container spacing={2}>
        {bookings.map((booking: any) => (
          <Grid size={{ xs: 12, md: 6 }} key={booking.id}>
            <Card
              sx={{ cursor: "pointer", "&:hover": { boxShadow: 4 } }}
              onClick={() => setSelectedBooking(booking)}
            >
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {booking.salonService?.service?.name}
                  </Typography>
                  <StatusChip status={booking.status} />
                </Box>

                <Typography variant="body2" color="text.secondary">
                  {booking.customer
                    ? `${booking.customer.firstName} ${booking.customer.lastName}`
                    : booking.guestName ?? "Anonymní"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(booking.startTime).toLocaleString("cs-CZ")} -{" "}
                  {new Date(booking.endTime).toLocaleTimeString("cs-CZ", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {booking.beautician?.firstName} {booking.beautician?.lastName}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {bookings.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          Žádné rezervace pro vybrané období
        </Typography>
      )}

      {/* Detail rezervace dialog */}
      <Dialog
        open={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedBooking && (
          <>
            <DialogTitle>
              Rezervace - {selectedBooking.salonService?.service?.name}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 1 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Zákazník</Typography>
                  <Typography>
                    {selectedBooking.customer
                      ? `${selectedBooking.customer.firstName} ${selectedBooking.customer.lastName}`
                      : selectedBooking.guestName ?? "Anonymní"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedBooking.customer?.email ?? selectedBooking.guestEmail}
                    {selectedBooking.customer?.phone ?? selectedBooking.guestPhone
                      ? ` | ${selectedBooking.customer?.phone ?? selectedBooking.guestPhone}`
                      : ""}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Termín</Typography>
                  <Typography>
                    {new Date(selectedBooking.startTime).toLocaleString("cs-CZ")} -{" "}
                    {new Date(selectedBooking.endTime).toLocaleTimeString("cs-CZ")}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <StatusChip status={selectedBooking.status} />
                </Box>
                {selectedBooking.note && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Poznámka</Typography>
                    <Typography>{selectedBooking.note}</Typography>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, flexWrap: "wrap", gap: 1 }}>
              {selectedBooking.status === "PENDING" && (
                <Button
                  variant="contained"
                  color="info"
                  onClick={() => updateStatus(selectedBooking.id, "CONFIRMED")}
                >
                  Potvrdit
                </Button>
              )}
              {selectedBooking.status === "CONFIRMED" && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => updateStatus(selectedBooking.id, "IN_PROGRESS")}
                >
                  Zahájit
                </Button>
              )}
              {selectedBooking.status === "IN_PROGRESS" && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => updateStatus(selectedBooking.id, "COMPLETED")}
                >
                  Dokončit
                </Button>
              )}
              {["PENDING", "CONFIRMED"].includes(selectedBooking.status) && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => updateStatus(selectedBooking.id, "CANCELLED")}
                >
                  Zrušit
                </Button>
              )}
              <Button onClick={() => setSelectedBooking(null)}>Zavřít</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </StaffLayout>
  );
}
