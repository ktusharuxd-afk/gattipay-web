"use client";
import { useEffect, useRef, useState } from "react";

interface ScanPageProps {
  onBack: () => void;
  onScan: (address: string) => void;
}

export default function ScanPage({ onBack, onScan }: ScanPageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setScanning(true);
      }
    } catch (e) {
      setError("Camera access denied. Please allow camera permission.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((t) => t.stop());
    }
  };

  const handleManualInput = () => {
    const address = prompt("Enter wallet address manually:");
    if (address && address.startsWith("0x")) {
      stopCamera();
      onScan(address);
    } else if (address) {
      alert("Invalid address — must start with 0x");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "24px 20px 0" }}>
        <button onClick={() => { stopCamera(); onBack(); }} style={{ background: "none", border: "1.5px solid var(--border)", borderRadius: 12, padding: "6px 14px", color: "var(--text-muted)", fontSize: 16, cursor: "pointer" }}>←</button>
        <span style={{ fontSize: 20, fontWeight: 800, color: "var(--text)" }}>Scan QR</span>
      </div>

      {/* Camera */}
      <div style={{ margin: "24px 16px 0", borderRadius: 24, overflow: "hidden", border: "1.5px solid var(--border)", position: "relative", background: "#000" }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{ width: "100%", height: 300, objectFit: "cover", display: "block" }}
        />
        {/* Scan Frame */}
        {scanning && (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 180, height: 180, border: "3px solid var(--accent)", borderRadius: 16 }} />
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ margin: "16px 16px 0", background: "#fee2e2", border: "1.5px solid var(--red)", borderRadius: 16, padding: "14px 20px" }}>
          <div style={{ fontSize: 13, color: "#991b1b" }}>{error}</div>
        </div>
      )}

      {/* Info */}
      <div style={{ margin: "16px 16px 0", background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 16, padding: "14px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
          Point camera at a wallet QR code to scan
        </div>
        <button
          onClick={handleManualInput}
          style={{ background: "var(--accent)", border: "none", borderRadius: 12, padding: "10px 24px", fontSize: 14, fontWeight: 700, color: "#0d1117", cursor: "pointer" }}
        >
          Enter address manually
        </button>
      </div>

    </div>
  );
}