"use client";

import { Card, CardContent, Typography, Box } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import { StatusChip } from "./StatusChip";

interface BookingCardProps {
  serviceName: string;
  beauticianName: string;
  salonName: string;
  startTime: string;
  endTime: string;
  status: string;
  price: number;
  onClick?: () => void;
}

export function BookingCard({
  serviceName,
  beauticianName,
  salonName,
  startTime,
  endTime,
  status,
  price,
  onClick,
}: BookingCardProps) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const dateStr = start.toLocaleDateString("cs-CZ", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });

  const timeStr = `${start.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })}`;

  const priceFormatted = new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    minimumFractionDigits: 0,
  }).format(price / 100);

  return (
    <Card
      sx={{ cursor: onClick ? "pointer" : "default", "&:hover": onClick ? { boxShadow: 4 } : {} }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
          <Typography variant="h6" component="div">
            {serviceName}
          </Typography>
          <StatusChip status={status} />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {salonName}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
          <PersonIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {beauticianName}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
          <CalendarTodayIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {dateStr}, {timeStr}
          </Typography>
        </Box>

        <Typography variant="subtitle1" color="primary" fontWeight={600}>
          {priceFormatted}
        </Typography>
      </CardContent>
    </Card>
  );
}
