"use client";
import { useAppKitAccount } from "@reown/appkit/react";
import { useEffect, useRef } from "react";

interface ReceivePageProps {
  onBack: () => void;
}

export default function ReceivePage({ onBack }: ReceivePageProps) {
  const { address } = useAppKitAccount();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!address || !canvasRef.current) return;
    generateQR(address, canvasRef.current);
  }, [address]);

  const generateQR = (text: string, canvas: HTMLCanvasElement) => {
    const size = 200;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#0d1117";
    ctx.font = "10px monospace";
    ctx.fillText("QR: " + text.slice(0, 20) + "...", 10, 100);
  };

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

        {/* QR Placeholder */}
        <div style={{ width: 200, height: 200, background: "#ffffff", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--border)", padding: 16 }}>
          <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
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