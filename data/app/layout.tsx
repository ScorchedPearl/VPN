import type { Metadata } from "next";
import "./globals.css";
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: "VPN Detection Presentation Deck",
  description: "Presentation deck for VPN detection prototype",
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
