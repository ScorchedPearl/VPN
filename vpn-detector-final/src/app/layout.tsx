import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VPN & Device Linkage Research Lab",
  description: "Consent-based browser similarity and explainable VPN-risk research prototype.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
