"use client";

import { usePathname, useRouter } from "next/navigation";
import { AppShell, type NavItem } from "@kosmetika/ui";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SettingsIcon from "@mui/icons-material/Settings";
import { Button } from "@mui/material";

const navItems: NavItem[] = [
  { label: "Přehled", icon: <DashboardIcon />, href: "/" },
  { label: "Rezervace", icon: <CalendarMonthIcon />, href: "/bookings" },
  { label: "Služby", icon: <ContentCutIcon />, href: "/services" },
  { label: "Zákazníci", icon: <PeopleIcon />, href: "/customers" },
  { label: "Fakturace", icon: <ReceiptIcon />, href: "/invoices" },
  { label: "Nastavení", icon: <SettingsIcon />, href: "/settings" },
];

export function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const items = navItems.map((item) => ({
    ...item,
    active: pathname === item.href,
  }));

  return (
    <AppShell
      title="Kosmetika Staff"
      navItems={items}
      onNavigate={(href) => router.push(href)}
      actions={
        <Button variant="outlined" size="small" href="/api/auth/signout">
          Odhlásit se
        </Button>
      }
    >
      {children}
    </AppShell>
  );
}
