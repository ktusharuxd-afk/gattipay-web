"use client";
import { useAppKitAccount } from "@reown/appkit/react";
import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface ReceivePageProps {
  onBack: () => void;
}

export default function ReceivePage({ onBack }: ReceivePageProps) {
  const { address } = useAppKitAccount();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!address || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, address, {
      width: 200,
      margin: 2,
      color: {
        dark: "#0d1117",
        light: "#ffffff",
      },
    });
  }, [address]);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      alert("Address copied!");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "24px 20px 0" }}>
        <button onClick={onBack} style={{ background: "none", border: "1.5px solid var(--border)", borderRadius: 12, padding: "6px 14px", color: "var(--text-muted)", fontSize: 16, cursor: "pointer" }}>←</button>
        <span style={{ fontSize: 20, fontWeight: 800, color: "var(--text)" }}>Receive</span>
      </div>

      {/* QR Code */}
      <div style={{ margin: "32px 16px 0", background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 24, padding: "32px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <div style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>Scan to receive BNB / wHON</div>

        {/* QR Canvas */}
        <div style={{ background: "#ffffff", borderRadius: 16, padding: 16, border: "2px solid var(--border)" }}>
          <canvas ref={canvasRef} />
        </div>

        {/* Address */}
        <div style={{ width: "100%", background: "var(--surface2)", border: "1.5px solid var(--border)", borderRadius: 14, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>Your wallet address</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", wordBreak: "break-all", fontFamily: "monospace" }}>
            {address || "—"}
          </div>
        </div>

        {/* Copy Button */}
        <button
          onClick={copyAddress}
          style={{ width: "100%", background: "var(--accent)", border: "none", borderRadius: 16, padding: "16px", fontSize: 15, fontWeight: 700, color: "#0d1117", cursor: "pointer" }}
        >
          Copy address
        </button>
      </div>

      {/* Note */}
      <div style={{ margin: "16px 16px 0", background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 16, padding: "14px 20px" }}>
        <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
          ⚠️ Only send <strong>BNB</strong> or <strong>wHON</strong> on <strong>BNB Smart Chain</strong> to this address. Sending other assets may result in permanent loss.
        </div>
      </div>

    </div>
  );
}