import type { Metadata } from "next";
import "./globals.css";
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: "CPS Lock · OOSC · IIIT Allahabad",
  description: "Interactive quiz deck for CPS Lock, organized by OOSC at IIIT Allahabad.",
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
