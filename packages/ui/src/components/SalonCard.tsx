"use client";

import { Card, CardContent, CardMedia, Typography, Box, Button } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";

interface SalonCardProps {
  name: string;
  description?: string;
  address: string;
  city: string;
  phone?: string;
  imageUrl?: string;
  onDetail?: () => void;
}

export function SalonCard({ name, description, address, city, phone, imageUrl, onDetail }: SalonCardProps) {
  return (
    <Card>
      {imageUrl && (
        <CardMedia component="img" height="180" image={imageUrl} alt={name} />
      )}
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {name}
        </Typography>

        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {description}
          </Typography>
        )}

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
          <LocationOnIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {address}, {city}
          </Typography>
        </Box>

        {phone && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1.5 }}>
            <PhoneIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {phone}
            </Typography>
          </Box>
        )}

        {onDetail && (
          <Button variant="outlined" fullWidth onClick={onDetail}>
            Zobrazit detail
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
