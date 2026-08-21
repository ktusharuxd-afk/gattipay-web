"use client";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

interface BuyPageProps {
  onBack: () => void;
  walletAddress?: string;
}

const TRANSAK_API_KEY = "79bb811e-5a9c-47dd-9f00-a8d648a64d4c";

export default function BuyPage({ onBack, walletAddress }: BuyPageProps) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://global.transak.com/sdk/v1.1/widget.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const transakUrl = `https://global.transak.com?apiKey=${TRANSAK_API_KEY}&defaultCryptoCurrency=BNB&defaultNetwork=bsc&walletAddress=${walletAddress || ""}&themeColor=06d6a0&hideMenu=true`;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px" }}>
        <button onClick={onBack} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "8px", cursor: "pointer", display: "flex" }}>
          <ArrowLeft size={18} color="var(--text-secondary)" />
        </button>
        <span style={{ fontSize: 17, fontWeight: 800, color: "var(--text)" }}>Buy Crypto</span>
      </div>

      <div style={{ flex: 1, overflow: "hidden" }}>
        <iframe
          src={transakUrl}
          style={{ width: "100%", height: "100%", border: "none" }}
          allow="camera;microphone;payment"
        />
      </div>
    </div>
  );
}