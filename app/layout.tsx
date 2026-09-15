import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "The Robo Battleground | Robowar Arena, Training & Precision Machining",
    template: "%s | The Robo Battleground",
  },
  description:
    "Robot combat arena, robotics & embedded systems training, CNC/VMC machining and 3D printing services, and custom engineering fabrication projects.",
  keywords: [
    "Robowar Arena",
    "Robot Battle Arena",
    "Robotics Training",
    "Robotics Workshop",
    "CNC Machining",
    "VMC Machining",
    "3D Printing",
    "Robot Parts Manufacturing",
    "Robotics Engineering",
    "Custom Engineering Projects",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "The Robo Battleground | Robowar Arena, Training & Precision Machining",
    description:
      "Robot combat arena, robotics training, and CNC/VMC/3D printing manufacturing services.",
    siteName: "The Robo Battleground",
    images: [{ url: "/brand/logo-full.png", width: 1254, height: 1254, alt: "The Robo Battleground" }],
  },
  manifest: "/manifest.json",
  twitter: {
    card: "summary_large_image",
    title: "The Robo Battleground | Robowar Arena, Training & Precision Machining",
    description:
      "Robot combat arena, robotics training, and CNC/VMC/3D printing manufacturing services.",
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
