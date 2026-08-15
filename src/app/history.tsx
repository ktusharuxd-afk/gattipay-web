"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, ArrowUpRight, Clock, ExternalLink } from "lucide-react";

interface HistoryPageProps {
  onBack: () => void;
}

export default function HistoryPage({ onBack }: HistoryPageProps) {
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("gattipay_txns");
    if (saved) setTransactions(JSON.parse(saved));
  }, []);

  const formatTime = (time: number) => {
    const d = new Date(time);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    return `${days}d ago`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px" }}>
        <button onClick={onBack} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "8px", cursor: "pointer", display: "flex" }}>
          <ArrowLeft size={18} color="var(--text-secondary)" />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 28, height: 28, borderRadius: 9, background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Clock size={14} color="var(--accent)" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 17, fontWeight: 800, color: "var(--text)" }}>History</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "0 16px", overflow: "auto" }}>
        {transactions.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Clock size={28} color="var(--text-muted)" strokeWidth={1.5} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)" }}>No transactions yet</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", maxWidth: 240 }}>Your transaction history will appear here once you make your first transfer.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 20 }}>
            {transactions.map((tx, i) => (
              <div key={tx.hash || i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(244,63,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <ArrowUpRight size={16} color="var(--red)" strokeWidth={2.5} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Sent BNB</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace", marginTop: 2 }}>
                        To {tx.to?.slice(0, 8)}...{tx.to?.slice(-6)}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "var(--red)" }}>-{tx.value} BNB</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{formatTime(tx.time)}</div>
                  </div>
                </div>
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "monospace" }}>
                    Tx: {tx.hash?.slice(0, 16)}...
                  </div>
                  <a href={`https://bscscan.com/tx/${tx.hash}`} target="_blank" style={{ fontSize: 10, color: "var(--accent)", textDecoration: "none", fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
                    BSCScan <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}