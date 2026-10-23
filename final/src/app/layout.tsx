import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Device Linkage Lab",
  description: "Consent-based research tool that estimates whether two visits come from the same device, across browsers and VPNs.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
