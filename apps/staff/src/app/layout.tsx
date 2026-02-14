import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { KosmetikaThemeProvider } from "@kosmetika/ui";

export const metadata: Metadata = {
  title: "Kosmetika Staff - Správa salonu",
  description: "Aplikace pro kosmetičky a správu salonu",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body>
        <AppRouterCacheProvider>
          <KosmetikaThemeProvider>
            {children}
          </KosmetikaThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
