import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VPN Detection Lab",
  description: "Consent-based research tool that detects VPNs, proxies and relays using IP reputation, latency geometry and device-anchored history.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
