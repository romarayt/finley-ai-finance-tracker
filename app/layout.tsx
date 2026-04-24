import type { Metadata, Viewport } from "next";
import { Instrument_Serif } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "sonner";

import "@/app/globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { ThemeProvider } from "@/components/layout/theme-provider";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  weight: "400",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Finley",
  description: "Personal AI finance tracker"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} ${instrumentSerif.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AppShell>{children}</AppShell>
          <Toaster richColors position="top-right" toastOptions={{ className: "font-sans", duration: 3000 }} />
        </ThemeProvider>
      </body>
    </html>
  );
}
