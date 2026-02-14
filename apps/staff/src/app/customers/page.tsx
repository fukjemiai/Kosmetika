"use client";

import { Typography } from "@mui/material";
import { StaffLayout } from "@/components/StaffLayout";
import { EmptyState } from "@kosmetika/ui";
import PeopleIcon from "@mui/icons-material/People";

export default function CustomersPage() {
  return (
    <StaffLayout>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Zákazníci
      </Typography>
      <EmptyState
        icon={<PeopleIcon />}
        title="Správa zákazníků"
        description="Zde se budou zobrazovat zákazníci, kteří se objednali. Zákazníci se automaticky vytvoří po provedení rezervace."
      />
    </StaffLayout>
  );
}
