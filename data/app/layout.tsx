import type { Metadata } from "next";
import "./globals.css";
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: "VPN Detection Research · Weeks 1–2",
  description: "Interactive research presentation covering the browser-fingerprinting VPN-risk prototype and Week 2 findings",
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
