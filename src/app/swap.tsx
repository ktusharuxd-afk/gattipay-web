"use client";
import { useAppKitAccount } from "@reown/appkit/react";
import { ArrowLeft } from "lucide-react";

interface SwapPageProps {
  onBack: () => void;
  activeAddress?: string;
  gattiPrivateKey?: string | null;
}

export default function SwapPage({ onBack, activeAddress }: SwapPageProps) {
  const { address: externalAddress } = useAppKitAccount();
  const address = activeAddress || externalAddress;
  const isGattiWallet = !!activeAddress && activeAddress !== externalAddress;

  const openPancakeSwap = () => {
    const url = `https://pancakeswap.finance/swap?outputCurrency=0x0A1Ac7aE511cEcE9493602815A11d1c53b253518&chain=bsc`;
    window.open(url, "_blank");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px" }}>
        <button onClick={onBack} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "8px", cursor: "pointer", display: "flex" }}>
          <ArrowLeft size={18} color="var(--text-secondary)" />
        </button>
        <span style={{ fontSize: 17, fontWeight: 800, color: "var(--text)" }}>Swap</span>
      </div>

      <div style={{ margin: "0 16px", background: "linear-gradient(145deg, var(--surface) 0%, var(--surface2) 100%)", border: "1px solid var(--border)", borderRadius: 24, padding: "20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 160, height: 160, background: "var(--accent-glow)", borderRadius: "50%", filter: "blur(70px)", pointerEvents: "none" }} />
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, position: "relative" }}>Swap via</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", marginBottom: 4, position: "relative" }}>PancakeSwap</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", position: "relative" }}>BNB Smart Chain • wHON/BNB pair</div>
      </div>

      <div style={{ margin: "14px 16px 0", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>wHON Contract (BSC)</div>
          <div style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text)", wordBreak: "break-all" }}>0x0A1Ac7aE511cEcE9493602815A11d1c53b253518</div>
        </div>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>Network</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>BNB Smart Chain (BSC)</div>
        </div>
        <div style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>Your Wallet</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isGattiWallet ? (
              <div style={{ width: 20, height: 20, borderRadius: 6, background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: "var(--accent)" }}>G</span>
              </div>
            ) : (
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="" style={{ width: 20, height: 20 }} />
            )}
            <span style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text)" }}>{address ? `${address.slice(0, 10)}...${address.slice(-6)}` : "Not connected"}</span>
          </div>
        </div>
      </div>

      <div style={{ margin: "20px 16px 0" }}>
        <button onClick={openPancakeSwap} style={{ width: "100%", background: "var(--accent)", border: "none", borderRadius: 16, padding: "16px", fontSize: 15, fontWeight: 800, color: "#0a0e14", cursor: "pointer", boxShadow: "0 0 24px var(--accent-glow)" }}>
          Open PancakeSwap →
        </button>
      </div>

      <div style={{ margin: "14px 16px 0", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "12px 16px" }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.7 }}>
          ⚠️ Swap opens in PancakeSwap. Make sure your active wallet is connected to <strong style={{ color: "var(--text)" }}>BNB Smart Chain</strong> before swapping.
        </div>
      </div>
    </div>
  );
}
