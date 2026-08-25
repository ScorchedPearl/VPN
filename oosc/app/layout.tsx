import type { Metadata } from "next";
import "./globals.css";
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: "CAPS LOCK · OOSC · IIIT Allahabad",
  description: "Interactive quiz deck for CAPS LOCK, organized by OOSC at IIIT Allahabad.",
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
