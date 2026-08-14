"use client";
import { useAppKitAccount } from "@reown/appkit/react";

interface SwapPageProps {
  onBack: () => void;
}

export default function SwapPage({ onBack }: SwapPageProps) {
  const { address } = useAppKitAccount();

  const openPancakeSwap = () => {
    const url = `https://pancakeswap.finance/swap?outputCurrency=0x0A1Ac7aE511cEcE9493602815A11d1c53b253518&chain=bsc`;
    window.open(url, "_blank");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "24px 20px 0" }}>
        <button onClick={onBack} style={{ background: "none", border: "1.5px solid var(--border)", borderRadius: 12, padding: "6px 14px", color: "var(--text-muted)", fontSize: 16, cursor: "pointer" }}>←</button>
        <span style={{ fontSize: 20, fontWeight: 800, color: "var(--text)" }}>Swap</span>
      </div>

      {/* wHON Info Card */}
      <div style={{ margin: "24px 16px 0", background: "var(--accent)", borderRadius: 24, padding: "28px 24px" }}>
        <div style={{ fontSize: 13, color: "rgba(0,0,0,0.5)", marginBottom: 8 }}>Swap via</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#0d1117", marginBottom: 4 }}>PancakeSwap</div>
        <div style={{ fontSize: 13, color: "rgba(0,0,0,0.6)" }}>BNB Smart Chain • wHON/BNB pair</div>
      </div>

      {/* Token Info */}
      <div style={{ margin: "16px 16px 0", background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>wHON Contract (BSC)</div>
          <div style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text)", wordBreak: "break-all" }}>
            0x0A1Ac7aE511cEcE9493602815A11d1c53b253518
          </div>
        </div>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Network</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>BNB Smart Chain (BSC)</div>
        </div>
        <div style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Your wallet</div>
          <div style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text)" }}>
            {address ? `${address.slice(0, 10)}...${address.slice(-6)}` : "Not connected"}
          </div>
        </div>
      </div>

      {/* Swap Button */}
      <div style={{ margin: "24px 16px 0" }}>
        <button
          onClick={openPancakeSwap}
          style={{ width: "100%", background: "var(--accent)", border: "none", borderRadius: 16, padding: "16px", fontSize: 16, fontWeight: 700, color: "#0d1117", cursor: "pointer" }}
        >
          Open PancakeSwap →
        </button>
      </div>

      {/* Note */}
      <div style={{ margin: "16px 16px 0", background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 16, padding: "14px 20px" }}>
        <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
          ⚠️ Swap opens in PancakeSwap. Make sure your MetaMask is connected to <strong>BNB Smart Chain</strong> before swapping.
        </div>
      </div>

    </div>
  );
}