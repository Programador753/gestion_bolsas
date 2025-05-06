// src/app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Providers } from "./providers"; // nuevo import

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Gestion de Bolsas",
  description: "Gestion de Bolsas",
};



export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

