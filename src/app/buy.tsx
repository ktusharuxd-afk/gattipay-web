"use client";
import { ArrowLeft, ExternalLink } from "lucide-react";

interface BuyPageProps {
  onBack: () => void;
  walletAddress?: string;
}

const TRANSAK_API_KEY = "79bb811e-5a9c-47dd-9f00-a8d648a64d4c";

export default function BuyPage({ onBack, walletAddress }: BuyPageProps) {
  const openTransak = () => {
    const url = `https://global-stg.transak.com?apiKey=${TRANSAK_API_KEY}&defaultCryptoCurrency=BNB&defaultNetwork=bsc&walletAddress=${walletAddress || ""}&themeColor=06d6a0&environment=STAGING`;
    window.open(url, "_blank");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px" }}>
        <button onClick={onBack} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "8px", cursor: "pointer", display: "flex" }}>
          <ArrowLeft size={18} color="var(--text-secondary)" />
        </button>
        <span style={{ fontSize: 17, fontWeight: 800, color: "var(--text)" }}>Buy Crypto</span>
      </div>

      <div style={{ margin: "0 16px", background: "linear-gradient(145deg, var(--surface) 0%, var(--surface2) 100%)", border: "1px solid var(--border)", borderRadius: 24, padding: "20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 160, height: 160, background: "var(--accent-glow)", borderRadius: "50%", filter: "blur(70px)", pointerEvents: "none" }} />
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, position: "relative" }}>Buy via</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", marginBottom: 4, position: "relative" }}>Transak</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", position: "relative" }}>UPI, Card, Netbanking → BNB directly to your wallet</div>
      </div>

      <div style={{ margin: "14px 16px 0", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "16px" }}>
        <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>Receiving Wallet</div>
        <div style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text)" }}>{walletAddress ? `${walletAddress.slice(0, 10)}...${walletAddress.slice(-6)}` : "Not connected"}</div>
      </div>

      <div style={{ margin: "20px 16px 0" }}>
        <button onClick={openTransak} style={{ width: "100%", background: "var(--accent)", border: "none", borderRadius: 16, padding: "16px", fontSize: 15, fontWeight: 800, color: "#0a0e14", cursor: "pointer", boxShadow: "0 0 24px var(--accent-glow)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          Open Transak <ExternalLink size={16} />
        </button>
      </div>

      <div style={{ margin: "14px 16px 0", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "12px 16px" }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.7 }}>
          Buy opens in Transak. Your wallet address is pre-filled — BNB will be sent directly to your GattiPay wallet after purchase.
        </div>
      </div>
    </div>
  );
}