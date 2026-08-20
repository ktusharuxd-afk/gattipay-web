"use client";
import { useAppKitAccount, useAppKit } from "@reown/appkit/react";
import { useBalance } from "wagmi";
import { ArrowLeft, User, Shield, Globe, Trash2, Settings, LogOut, ChevronRight, Copy, Check, Users, Bell } from "lucide-react";
import { useState } from "react";

interface ProfilePageProps {
  onBack: () => void;
  onOpenContacts?: () => void;
  onOpenAlerts?: () => void;
}

export default function ProfilePage({ onBack, onOpenContacts, onOpenAlerts }: ProfilePageProps) {
  const { address, isConnected } = useAppKitAccount();
  const { open } = useAppKit();
  const { data: bnbBalance } = useBalance({ address: address as `0x${string}`, chainId: 56 });
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearHistory = () => {
    if (confirm("Clear all transaction history?")) {
      localStorage.removeItem("gattipay_txns");
      alert("History cleared!");
    }
  };

  const disconnect = () => {
    const m = document.querySelector('w3m-modal') as HTMLElement;
    if (m) m.removeAttribute('style');
    open({ view: "Account" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", background: "var(--bg)" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px" }}>
        <button onClick={onBack} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "8px", cursor: "pointer", display: "flex" }}>
          <ArrowLeft size={18} color="var(--text-secondary)" />
        </button>
        <span style={{ fontSize: 17, fontWeight: 800, color: "var(--text)" }}>Profile</span>
      </div>

      {/* Avatar Card */}
      <div style={{ margin: "0 16px", background: "linear-gradient(145deg, var(--surface) 0%, var(--surface2) 100%)", border: "1px solid var(--border)", borderRadius: 24, padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 160, height: 160, background: "var(--accent-glow)", borderRadius: "50%", filter: "blur(70px)", pointerEvents: "none" }} />
        
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--accent-dim)", border: "2px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <User size={28} color="var(--accent)" />
        </div>
        
        <div style={{ textAlign: "center", position: "relative" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", fontFamily: "monospace" }}>
            {address ? `${address.slice(0, 10)}...${address.slice(-8)}` : "Not connected"}
          </div>
          <div style={{ fontSize: 11, color: isConnected ? "var(--accent)" : "var(--text-muted)", fontWeight: 600, marginTop: 4 }}>
            {isConnected ? "● BNB Smart Chain" : "Not connected"}
          </div>
        </div>

        <button onClick={copyAddress} style={{ background: "var(--surface3)", border: "1px solid var(--border-light)", borderRadius: 10, padding: "6px 16px", fontSize: 11, fontWeight: 700, color: copied ? "var(--accent)" : "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, transition: "all 0.2s" }}>
          {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy Address</>}
        </button>
      </div>

      {/* Info Cards */}
      <div style={{ margin: "14px 16px 0", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
        {[
          { icon: <Globe size={16} color="var(--accent)" />, label: "Network", value: "BNB Smart Chain" },
          { icon: <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F0B90B", margin: "4px" }} />, label: "BNB Balance", value: `${bnbBalance ? (Number(bnbBalance.value) / 1e18).toFixed(4) : "0.0000"} BNB` },
          { icon: <Shield size={16} color="var(--accent)" />, label: "Status", value: isConnected ? "Connected" : "Disconnected", color: isConnected ? "var(--accent)" : "var(--red)" },
        ].map((item, i) => (
          <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: i < 2 ? "1px solid var(--border)" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {item.icon}
              </div>
              <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>{item.label}</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: item.color || "var(--text)" }}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ margin: "14px 16px 0", display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { icon: <Users size={16} />, label: "Manage Contacts", action: () => onOpenContacts?.(), color: "var(--text-secondary)" },
                    { icon: <Bell size={16} />, label: "Price Alerts", action: () => onOpenAlerts?.(), color: "var(--text-secondary)" },
          { icon: <Settings size={16} />, label: "Wallet Settings", action: disconnect, color: "var(--text-secondary)" },
          { icon: <Trash2 size={16} />, label: "Clear History", action: clearHistory, color: "var(--text-secondary)" },
        ].map((item) => (
          <button key={item.label} onClick={item.action} style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ color: item.color }}>{item.icon}</div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{item.label}</span>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </button>
        ))}

        <button onClick={disconnect} style={{ width: "100%", background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }}>
          <LogOut size={16} color="var(--red)" />
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--red)" }}>Disconnect Wallet</span>
        </button>
      </div>

      {/* Footer */}
      <div style={{ marginTop: "auto", padding: "20px 16px", textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>GattiPay v1.0.0</div>
        <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>© 2026 Star Technologies</div>
      </div>

    </div>
  );
}