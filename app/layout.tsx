import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import ClientThemeProvider from "@/components/ThemeProvider";
import { SnackbarProvider } from '@/contexts/SnackbarContext';
import "./globals.css";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SpoutBreeze",
  description: "SpoutBreeze is a professional platform that simplifies hosting, attending, and managing webinars.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/spoutbreeze_icon.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>SpoutBreeze</title>
      </head>
      <body className={`${montserrat.className} flex flex-col min-h-screen mx-auto max-w-screen-container`}>
        <ClientThemeProvider>
          <nav>
            <Suspense fallback={<div className="h-[80px] bg-white border-b border-[#E0E5EC]"></div>}>
              <Navbar />
            </Suspense>
          </nav>
          <main className="pt-[80px]">
            <SnackbarProvider>
              {children}
            </SnackbarProvider>
          </main>
        </ClientThemeProvider>
      </body>
    </html>
  );
}
