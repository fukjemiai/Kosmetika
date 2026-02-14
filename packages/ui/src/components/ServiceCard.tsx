"use client";

import { Card, CardContent, Typography, Box, Chip, Button } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

interface ServiceCardProps {
  name: string;
  description?: string;
  category?: string;
  price: number;      // v haléřích
  duration: number;   // v minutách
  onBook?: () => void;
}

export function ServiceCard({ name, description, category, price, duration, onBook }: ServiceCardProps) {
  const priceFormatted = new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    minimumFractionDigits: 0,
  }).format(price / 100);

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
          <Box>
            <Typography variant="h6" component="div">
              {name}
            </Typography>
            {category && (
              <Chip label={category} size="small" color="secondary" variant="outlined" sx={{ mt: 0.5 }} />
            )}
          </Box>
          <Typography variant="h6" color="primary" fontWeight={700}>
            {priceFormatted}
          </Typography>
        </Box>

        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {description}
          </Typography>
        )}

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <AccessTimeIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {duration} min
            </Typography>
          </Box>

          {onBook && (
            <Button variant="contained" size="small" onClick={onBook}>
              Objednat
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
