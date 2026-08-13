"use client";
import { useState, useEffect } from "react";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";

export default function Home() {
  const [theme, setTheme] = useState("light");
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 20px 0" }}>
        <span style={{ fontSize: 24, fontWeight: 800, color: "var(--accent)", letterSpacing: "-0.5px" }}>GattiPay</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={toggleTheme} style={{ background: "none", border: "1.5px solid var(--border)", borderRadius: 20, padding: "5px 14px", color: "var(--text-muted)", fontSize: 12, cursor: "pointer" }}>
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
          <button onClick={() => open()} style={{ fontSize: 12, background: isConnected ? "var(--surface2)" : "var(--accent)", border: "1.5px solid var(--border)", borderRadius: 20, padding: "5px 12px", color: isConnected ? "var(--green)" : "#0d1117", fontWeight: 600, cursor: "pointer" }}>
            {isConnected ? `● ${shortAddress}` : "Connect Wallet"}
          </button>
        </div>
      </div>

      {/* Balance Card */}
      <div style={{ margin: "24px 16px 0", background: "var(--accent)", borderRadius: 24, padding: "28px 24px" }}>
        <div style={{ color: "rgba(0,0,0,0.5)", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Total balance</div>
        <div style={{ fontSize: 42, fontWeight: 800, color: "#0d1117", marginBottom: 20, letterSpacing: "-1px" }}>₹0.00</div>
        <div style={{ display: "flex", gap: 8 }}>
          {["HON", "ETH", "wHON"].map((asset) => (
            <span key={asset} style={{ fontSize: 12, background: "rgba(0,0,0,0.12)", borderRadius: 20, padding: "4px 12px", color: "#0d1117", fontWeight: 500 }}>
              {asset} 0.00
            </span>
          ))}
        </div>
      </div>

      {/* Connect Prompt */}
      {!isConnected && (
        <div style={{ margin: "16px 16px 0", background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 16, padding: "16px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>Connect your wallet to view balances</div>
          <button onClick={() => open()} style={{ background: "var(--accent)", border: "none", borderRadius: 12, padding: "10px 24px", color: "#0d1117", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            Connect Wallet
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ display: "flex", justifyContent: "space-around", margin: "28px 16px" }}>
        {[
          { icon: "↑", label: "Send" },
          { icon: "↓", label: "Receive" },
          { icon: "⊙", label: "Scan" },
          { icon: "⇄", label: "Swap" },
        ].map((action) => (
          <div key={action.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <div style={{ width: 60, height: 60, background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "var(--accent)" }}>
              {action.icon}
            </div>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{action.label}</span>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div style={{ flex: 1, margin: "0 16px" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>Recent activity</div>
        <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 16, padding: "20px", color: "var(--text-muted)", fontSize: 14, textAlign: "center" }}>
          No transactions yet
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{ display: "flex", justifyContent: "space-around", padding: "16px 0 28px", borderTop: "1.5px solid var(--border)", marginTop: 24, background: "var(--bg)" }}>
        {[
          { icon: "⌂", label: "Home", active: true },
          { icon: "◈", label: "Wallet" },
          { icon: "≡", label: "History" },
          { icon: "◯", label: "Profile" },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}>
            <span style={{ fontSize: 20, color: item.active ? "var(--accent)" : "var(--text-muted)" }}>{item.icon}</span>
            <span style={{ fontSize: 11, fontWeight: item.active ? 600 : 400, color: item.active ? "var(--accent)" : "var(--text-muted)" }}>{item.label}</span>
          </div>
        ))}
      </div>

    </div>
  );
}