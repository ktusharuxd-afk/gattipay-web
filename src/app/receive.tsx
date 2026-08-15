"use client";
import { useAppKitAccount } from "@reown/appkit/react";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { ArrowLeft, ArrowDownLeft, Copy, Check, AlertTriangle } from "lucide-react";

interface ReceivePageProps {
  onBack: () => void;
}

export default function ReceivePage({ onBack }: ReceivePageProps) {
  const { address } = useAppKitAccount();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!address || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, address, {
      width: 200,
      margin: 2,
      color: { dark: "#0a0e14", light: "#ffffff" },
    });
  }, [address]);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px" }}>
        <button onClick={onBack} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "8px", cursor: "pointer", display: "flex" }}>
          <ArrowLeft size={18} color="var(--text-secondary)" />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 28, height: 28, borderRadius: 9, background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ArrowDownLeft size={14} color="var(--accent)" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 17, fontWeight: 800, color: "var(--text)" }}>Receive</span>
        </div>
      </div>

      {/* QR Card */}
      <div style={{ margin: "0 16px", background: "linear-gradient(145deg, var(--surface) 0%, var(--surface2) 100%)", border: "1px solid var(--border)", borderRadius: 24, padding: "28px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 160, height: 160, background: "var(--accent-glow)", borderRadius: "50%", filter: "blur(70px)", pointerEvents: "none" }} />
        
        <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, position: "relative" }}>Scan to receive BNB / wHON</div>

        <div style={{ background: "#ffffff", borderRadius: 20, padding: 20, position: "relative" }}>
          <canvas ref={canvasRef} style={{ display: "block" }} />
        </div>

        {/* Address */}
        <div style={{ width: "100%", background: "var(--surface3)", border: "1px solid var(--border-light)", borderRadius: 14, padding: "12px 16px", position: "relative" }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Your Wallet Address</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", wordBreak: "break-all", fontFamily: "monospace", lineHeight: 1.6 }}>
            {address || "Not connected"}
          </div>
        </div>

        {/* Copy Button */}
        <button
          onClick={copyAddress}
          style={{
            width: "100%",
            background: copied ? "var(--accent-dim)" : "var(--accent)",
            border: "none", borderRadius: 16, padding: "14px",
            fontSize: 14, fontWeight: 800,
            color: copied ? "var(--accent)" : "#0a0e14",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: copied ? "none" : "0 0 24px var(--accent-glow)",
            transition: "all 0.2s"
          }}
        >
          {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy Address</>}
        </button>
      </div>

      {/* Warning */}
      <div style={{ margin: "12px 16px 0", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
        <AlertTriangle size={15} color="var(--yellow)" style={{ marginTop: 2, flexShrink: 0 }} />
        <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.7 }}>
          Only send <strong style={{ color: "var(--text)" }}>BNB</strong> or <strong style={{ color: "var(--text)" }}>wHON</strong> on <strong style={{ color: "var(--text)" }}>BNB Smart Chain</strong> to this address.
        </div>
      </div>

    </div>
  );
}