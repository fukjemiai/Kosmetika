"use client";

import { Chip, type ChipProps } from "@mui/material";

const STATUS_CONFIG: Record<string, { label: string; color: ChipProps["color"] }> = {
  PENDING: { label: "Čeká na potvrzení", color: "warning" },
  CONFIRMED: { label: "Potvrzeno", color: "info" },
  IN_PROGRESS: { label: "Probíhá", color: "primary" },
  COMPLETED: { label: "Dokončeno", color: "success" },
  CANCELLED: { label: "Zrušeno", color: "default" },
  NO_SHOW: { label: "Nedostavil/a se", color: "error" },
  // Invoice statuses
  DRAFT: { label: "Koncept", color: "default" },
  ISSUED: { label: "Vystaveno", color: "info" },
  PAID: { label: "Zaplaceno", color: "success" },
  OVERDUE: { label: "Po splatnosti", color: "error" },
};

interface StatusChipProps {
  status: string;
}

export function StatusChip({ status }: StatusChipProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, color: "default" as const };

  return <Chip label={config.label} color={config.color} size="small" variant="outlined" />;
}
