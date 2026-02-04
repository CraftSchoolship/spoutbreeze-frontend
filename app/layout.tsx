import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ClientThemeProvider from "@/components/ThemeProvider";
import { SnackbarProvider } from '@/contexts/SnackbarContext';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BlueScale - Where Ideas Scale to New Heights",
  description: "BlueScale is a modern platform that makes hosting, attending, and managing webinars seamless. Deliver impactful virtual experiences with confidence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/bluescale_logo.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0ea5e9" />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen mx-auto max-w-screen-container bg-slate-50`}>
        <ClientThemeProvider>
          <nav>
            <Suspense fallback={<div className="h-[72px] glass-effect border-b border-slate-100"></div>}>
              <Navbar />
            </Suspense>
          </nav>
          <main className="pt-[72px]">
            <SnackbarProvider>
              {children}
            </SnackbarProvider>
          </main>
        </ClientThemeProvider>
      </body>
    </html>
  );
}
