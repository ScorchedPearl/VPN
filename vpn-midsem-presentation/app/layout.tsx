import type { Metadata } from "next";
import "./globals.css";
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: "VPN Detection · Midsem Research Presentation",
  description: "Editable 20-slide midsem presentation structure",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
