import type { ReactNode } from "react";
import "../globals.css";
import { geistSans, geistMono } from "@/lib/fonts";
import { ThemeProvider } from "@/lib/theme";
import { LanguageProvider } from "@/lib/i18n";

export default function OrdersLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="uz"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg text-text">
        <ThemeProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
