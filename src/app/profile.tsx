"use client";
import { useAppKitAccount, useAppKit } from "@reown/appkit/react";
import { useBalance } from "wagmi";

interface ProfilePageProps {
  onBack: () => void;
}

export default function ProfilePage({ onBack }: ProfilePageProps) {
  const { address, isConnected } = useAppKitAccount();
  const { open } = useAppKit();
  const { data: bnbBalance } = useBalance({
    address: address as `0x${string}`,
    chainId: 56,
  });

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      alert("Address copied!");
    }
  };

  const clearHistory = () => {
    if (confirm("Clear all transaction history?")) {
      localStorage.removeItem("gattipay_txns");
      alert("History cleared!");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "24px 20px 0" }}>
        <button onClick={onBack} style={{ background: "none", border: "1.5px solid var(--border)", borderRadius: 12, padding: "6px 14px", color: "var(--text-muted)", fontSize: 16, cursor: "pointer" }}>←</button>
        <span style={{ fontSize: 20, fontWeight: 800, color: "var(--text)" }}>Profile</span>
      </div>

      {/* Avatar + Address */}
      <div style={{ margin: "32px 16px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{ width: 80, height: 80, background: "var(--accent)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, color: "#0d1117", fontWeight: 900 }}>
          {address ? address.slice(2, 4).toUpperCase() : "?"}
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", fontFamily: "monospace" }}>
            {address ? `${address.slice(0, 10)}...${address.slice(-8)}` : "Not connected"}
          </div>
          {address && (
            <button onClick={copyAddress} style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 4 }}>
              Copy full address
            </button>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div style={{ margin: "32px 16px 0", background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Network</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>BNB Smart Chain (BSC)</div>
        </div>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>BNB Balance</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
            {bnbBalance ? (Number(bnbBalance.value) / 1e18).toFixed(4) : "0.0000"} BNB
          </div>
        </div>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Connection Status</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: isConnected ? "var(--green)" : "var(--red)" }}>
            {isConnected ? "● Connected" : "○ Not connected"}
          </div>
        </div>
        <div style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>App Version</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>GattiPay v1.0.0</div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ margin: "24px 16px 0", display: "flex", flexDirection: "column", gap: 12 }}>
        <button onClick={clearHistory} style={{ width: "100%", background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 16, padding: "16px", fontSize: 14, fontWeight: 600, color: "var(--text-muted)", cursor: "pointer" }}>
          🗑️ Clear Transaction History
        </button>
        <button onClick={() => open({ view: "Account" })} style={{ width: "100%", background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 16, padding: "16px", fontSize: 14, fontWeight: 600, color: "var(--text-muted)", cursor: "pointer" }}>
          ⚙️ Wallet Settings
        </button>
        <button onClick={() => open({ view: "Account" })} style={{ width: "100%", background: "var(--red)", border: "none", borderRadius: 16, padding: "16px", fontSize: 14, fontWeight: 700, color: "#ffffff", cursor: "pointer" }}>
          Disconnect Wallet
        </button>
      </div>

      {/* Footer */}
      <div style={{ margin: "auto 16px 32px", textAlign: "center" }}>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Built by Star Technologies</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>© 2026 GattiPay — Non-custodial crypto payments</div>
      </div>

    </div>
  );
}