"use client";
import { useAppKitAccount } from "@reown/appkit/react";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { ArrowLeft, Copy, Check, AlertTriangle, DollarSign } from "lucide-react";

interface ReceivePageProps {
  onBack: () => void;
  overrideAddress?: string;
  isGattiWallet?: boolean;
}

export default function ReceivePage({ onBack, overrideAddress, isGattiWallet }: ReceivePageProps) {
  const { address: externalAddress } = useAppKitAccount();
  const address = overrideAddress || externalAddress;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [requestAmount, setRequestAmount] = useState("");
  const [showRequestInput, setShowRequestInput] = useState(false);

  const qrData = requestAmount && parseFloat(requestAmount) > 0
    ? `ethereum:${address}?value=${requestAmount}`
    : address;

  useEffect(() => {
    if (!address || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, qrData || "", {
      width: 200,
      margin: 2,
      color: { dark: "#0a0e14", light: "#ffffff" },
    });
  }, [address, requestAmount]);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px" }}>
        <button onClick={onBack} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "8px", cursor: "pointer", display: "flex" }}>
          <ArrowLeft size={18} color="var(--text-secondary)" />
        </button>
        <span style={{ fontSize: 17, fontWeight: 800, color: "var(--text)" }}>Receive</span>
      </div>

      <div style={{ margin: "0 16px", background: "linear-gradient(145deg, var(--surface) 0%, var(--surface2) 100%)", border: "1px solid var(--border)", borderRadius: 24, padding: "28px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 160, height: 160, background: "var(--accent-glow)", borderRadius: "50%", filter: "blur(70px)", pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 6, position: "relative" }}>
          {isGattiWallet ? (
            <div style={{ width: 18, height: 18, borderRadius: 6, background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: "var(--accent)" }}>G</span>
            </div>
          ) : (
            <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="" style={{ width: 16, height: 16 }} />
          )}
          <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>
            {requestAmount && parseFloat(requestAmount) > 0 ? `Requesting ${requestAmount} BNB` : "Scan to receive BNB / wHON"}
          </div>
        </div>

        <div style={{ background: "#ffffff", borderRadius: 20, padding: 20, position: "relative" }}>
          <canvas ref={canvasRef} style={{ display: "block" }} />
        </div>

        {!showRequestInput ? (
          <button onClick={() => setShowRequestInput(true)} style={{ width: "100%", background: "var(--surface3)", border: "1px dashed var(--border-light)", borderRadius: 14, padding: "12px", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, position: "relative" }}>
            <DollarSign size={14} /> Request a specific amount
          </button>
        ) : (
          <div style={{ width: "100%", position: "relative" }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Amount (BNB)</div>
            <input
              value={requestAmount}
              onChange={(e) => setRequestAmount(e.target.value)}
              placeholder="0.00"
              type="number"
              autoFocus
              style={{ width: "100%", background: "var(--surface3)", border: "1px solid var(--border-light)", borderRadius: 12, padding: "12px 14px", fontSize: 16, fontWeight: 800, color: "var(--text)", outline: "none" }}
            />
            {requestAmount && (
              <button onClick={() => { setRequestAmount(""); setShowRequestInput(false); }} style={{ marginTop: 8, background: "none", border: "none", color: "var(--text-muted)", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                Clear amount
              </button>
            )}
          </div>
        )}

        <div style={{ width: "100%", background: "var(--surface3)", border: "1px solid var(--border-light)", borderRadius: 14, padding: "12px 16px", position: "relative" }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Your Wallet Address</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", wordBreak: "break-all", fontFamily: "monospace", lineHeight: 1.6 }}>
            {address || "Not connected"}
          </div>
        </div>

        <button onClick={copyAddress} style={{ width: "100%", background: copied ? "var(--accent-dim)" : "var(--accent)", border: "none", borderRadius: 16, padding: "14px", fontSize: 14, fontWeight: 800, color: copied ? "var(--accent)" : "#0a0e14", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: copied ? "none" : "0 0 24px var(--accent-glow)", position: "relative" }}>
          {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy Address</>}
        </button>
      </div>

      <div style={{ margin: "12px 16px 0", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
        <AlertTriangle size={15} color="var(--yellow)" style={{ marginTop: 2, flexShrink: 0 }} />
        <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.7 }}>
          Only send <strong style={{ color: "var(--text)" }}>BNB</strong> or <strong style={{ color: "var(--text)" }}>wHON</strong> on <strong style={{ color: "var(--text)" }}>BNB Smart Chain</strong> to this address.
        </div>
      </div>
    </div>
  );
}
