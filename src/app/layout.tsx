import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Script from "next/script";
import AnalyticsWrapper from "./components/AnalyticsWrapper";
import { PersonSchema, WebsiteSchema } from "./components/StructuredData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://yamalverse.com"),
  title: {
    default: "Yamalverse - Lamine Yamal Career Stats and Records",
    template: "%s | Yamalverse",
  },
  description:
    "Track Lamine Yamal goals, assists, appearances, trophies, and milestones with a clean, football-focused dashboard.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yamalverse.com",
    siteName: "Yamalverse",
    title: "Yamalverse - Lamine Yamal Career Stats and Records",
    description:
      "Track Lamine Yamal goals, assists, appearances, trophies, and milestones with a clean, football-focused dashboard.",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "Yamalverse",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yamalverse - Lamine Yamal Career Stats and Records",
    description:
      "Track Lamine Yamal goals, assists, appearances, trophies, and milestones with a clean, football-focused dashboard.",
    images: ["/og-image.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "FPAzwi2VnyYUEGMu6-rb-s0Var9TNQh6iu6ogbmWh34",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WebsiteSchema />
        <PersonSchema />
        <Navbar/>
        {children}
        <AnalyticsWrapper />
        {/* Defer third-party script loading - loads after hydration (bundle-defer-third-party) */}
        <Script 
          src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js"
          strategy="afterInteractive"
          data-name="BMC-Widget" 
          data-cfasync="false" 
          data-id="yamalverse" 
          data-description="Support Yamalverse on Buy Me a Coffee!" 
          data-message="Love the stats? Support Yamalverse and help it grow 💜" 
          data-color="#BD5FFF" 
          data-position="Right" 
          data-x_margin="18" 
          data-y_margin="18"
        />
      </body>
    </html>
  );
}
