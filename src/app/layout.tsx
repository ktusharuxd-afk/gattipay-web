import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GattiPay",
  description: "Decentralized crypto payments — simple as GPay",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
