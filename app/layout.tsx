import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import ClientThemeProvider from "@/components/ThemeProvider";
import { SnackbarProvider } from '@/contexts/SnackbarContext';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BlueScale — Flat-Rate Webinar Platform (Pay Per Moderator)",
  description: "BlueScale is a webinar platform with flat pricing: pay only for moderators while attendees watch free via YouTube or Twitch. Save up to 99% vs Zoom or Livestorm.",
  alternates: {
    canonical: "https://bluescale.craftschoolship.com/",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
  },
  openGraph: {
    type: "website",
    siteName: "BlueScale",
    title: "BlueScale — Flat-Rate Webinar Platform (Pay Per Moderator)",
    description: "Webinar platform with flat pricing: pay only for moderators, attendees watch free via YouTube/Twitch. Save up to 99% vs traditional tools.",
    url: "https://bluescale.craftschoolship.com/",
    images: [
      {
        url: "https://bluescale.craftschoolship.com/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BlueScale — Flat-Rate Webinar Platform",
    description: "Pay per moderator, not per attendee. Save up to 99% vs Zoom/Livestorm.",
    images: ["https://bluescale.craftschoolship.com/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/bluescale_logo.svg" />
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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-P5EWGYMTHK"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-P5EWGYMTHK');
          `}
        </Script>
      </body>
    </html>
  );
}
