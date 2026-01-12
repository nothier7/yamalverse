import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";   
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yamalverse",
  description: "All Stats and Data about Lamine Yamal. Lamine Yamal goals, assists, appearances, trophies, and more.",
  icons: {
    icon: '/favicon.ico',
  },
  verification: {
    google: 'FPAzwi2VnyYUEGMu6-rb-s0Var9TNQh6iu6ogbmWh34',
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
        <Navbar/>
        {children}
        <Analytics />
        <script 
          data-name="BMC-Widget" 
          data-cfasync="false" 
          src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js" 
          data-id="yamalverse" 
          data-description="Support Yamalverse on Buy Me a Coffee!" 
          data-message="Love the stats? Support Yamalverse and help it grow 💜" 
          data-color="#BD5FFF" 
          data-position="Right" 
          data-x_margin="18" 
          data-y_margin="18"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer">
        </script>
      </body>
    </html>
  );
}
