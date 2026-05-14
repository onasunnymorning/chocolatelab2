import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LanguageProvider } from "@/i18n/context";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chocolate Lab — Refinement Tracker",
  description:
    "Mobile-first shop floor tracker for bean-to-bar chocolate batch refinement. Monitor your melanger in real time.",
  keywords: ["chocolate", "refinement", "melanger", "bean-to-bar", "tracking"],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ChocLab",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2d1a0e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen choc-gradient`}
      >
        <LanguageProvider>
          <ServiceWorkerRegistrar />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
