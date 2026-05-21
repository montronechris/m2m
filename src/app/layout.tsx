// src/app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "TavolaRapida",
  description: "Ordina dal telefono",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" data-scroll-behavior="smooth">
      <body className={inter.className}>{children}</body>
    </html>
  );
}