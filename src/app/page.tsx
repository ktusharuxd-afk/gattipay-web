"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 20px 0" }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: "var(--accent)" }}>GattiPay</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={toggleTheme} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 20, padding: "6px 14px", color: "var(--text-muted)", fontSize: 13, cursor: "pointer" }}>
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
          <span style={{ fontSize: 12, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 20, padding: "4px 12px", color: "var(--green)" }}>● Connected</span>
        </div>
      </div>

      {/* Balance Card */}
      <div style={{ margin: "20px 16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "24px 20px" }}>
        <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 6 }}>Total balance</div>
        <div style={{ fontSize: 36, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>₹0.00</div>
        <div style={{ display: "flex", gap: 8 }}>
          {["HON", "ETH", "wHON"].map((asset) => (
            <span key={asset} style={{ fontSize: 12, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 20, padding: "4px 12px", color: "var(--text-muted)" }}>
              {asset} 0.00
            </span>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: "flex", justifyContent: "space-around", margin: "0 16px 24px" }}>
        {[
          { icon: "↑", label: "Send" },
          { icon: "↓", label: "Receive" },
          { icon: "⊙", label: "Scan" },
          { icon: "⇄", label: "Swap" },
        ].map((action) => (
          <div key={action.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <div style={{ width: 56, height: 56, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "var(--accent)" }}>
              {action.icon}
            </div>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{action.label}</span>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div style={{ flex: 1, margin: "0 16px" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-muted)", marginBottom: 12 }}>Recent activity</div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "16px 20px", color: "var(--text-muted)", fontSize: 14, textAlign: "center" }}>
          No transactions yet
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{ display: "flex", justifyContent: "space-around", padding: "16px 0 24px", borderTop: "1px solid var(--border)", marginTop: 24, background: "var(--bg)" }}>
        {[
          { icon: "⌂", label: "Home", active: true },
          { icon: "◈", label: "Wallet" },
          { icon: "≡", label: "History" },
          { icon: "◯", label: "Profile" },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}>
            <span style={{ fontSize: 20, color: item.active ? "var(--accent)" : "var(--text-muted)" }}>{item.icon}</span>
            <span style={{ fontSize: 11, color: item.active ? "var(--accent)" : "var(--text-muted)" }}>{item.label}</span>
          </div>
        ))}
      </div>

    </div>
  );
}