"use client";

import { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PeopleIcon from "@mui/icons-material/People";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { StaffLayout } from "@/components/StaffLayout";
import { BookingCard } from "@kosmetika/ui";

const API_URL = process.env.NEXT_PUBLIC_STAFF_API_URL ?? "http://localhost:3001";

export default function DashboardPage() {
  const [todayBookings, setTodayBookings] = useState<any[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    // V produkci by toto šlo přes authenticated request
    fetch(`${API_URL}/api/bookings?from=${today}&to=${tomorrow}`)
      .then((r) => {
        if (r.ok) return r.json();
        return [];
      })
      .then(setTodayBookings)
      .catch(() => setTodayBookings([]));
  }, []);

  const stats = [
    {
      label: "Dnes rezervací",
      value: todayBookings.length,
      icon: <CalendarTodayIcon />,
      color: "#9C27B0",
    },
    {
      label: "Potvrzeno",
      value: todayBookings.filter((b) => b.status === "CONFIRMED").length,
      icon: <PeopleIcon />,
      color: "#2196F3",
    },
    {
      label: "Dokončeno",
      value: todayBookings.filter((b) => b.status === "COMPLETED").length,
      icon: <TrendingUpIcon />,
      color: "#4CAF50",
    },
    {
      label: "Dnešní tržba",
      value: new Intl.NumberFormat("cs-CZ", {
        style: "currency",
        currency: "CZK",
        minimumFractionDigits: 0,
      }).format(
        todayBookings
          .filter((b) => b.status === "COMPLETED")
          .reduce((sum: number, b: any) => {
            const price =
              b.salonService?.price ?? b.salonService?.service?.defaultPrice ?? 0;
            return sum + price / 100;
          }, 0),
      ),
      icon: <AttachMoneyIcon />,
      color: "#FF9800",
    },
  ];

  return (
    <StaffLayout>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Přehled
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.label}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color, opacity: 0.8 }}>{stat.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Dnešní rezervace
      </Typography>

      {todayBookings.length === 0 ? (
        <Typography color="text.secondary">Žádné rezervace na dnešek</Typography>
      ) : (
        <Grid container spacing={2}>
          {todayBookings.map((booking: any) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={booking.id}>
              <BookingCard
                serviceName={booking.salonService?.service?.name ?? "Služba"}
                beauticianName={`${booking.beautician?.firstName ?? ""} ${booking.beautician?.lastName ?? ""}`}
                salonName={booking.salon?.name ?? "Salon"}
                startTime={booking.startTime}
                endTime={booking.endTime}
                status={booking.status}
                price={
                  booking.salonService?.price ??
                  booking.salonService?.service?.defaultPrice ??
                  0
                }
              />
            </Grid>
          ))}
        </Grid>
      )}
    </StaffLayout>
  );
}
