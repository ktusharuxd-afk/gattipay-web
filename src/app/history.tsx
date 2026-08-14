"use client";
import { useState, useEffect } from "react";

interface HistoryPageProps {
  onBack: () => void;
}

export default function HistoryPage({ onBack }: HistoryPageProps) {
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("gattipay_txns");
    if (saved) setTransactions(JSON.parse(saved));
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "24px 20px 0" }}>
        <button onClick={onBack} style={{ background: "none", border: "1.5px solid var(--border)", borderRadius: 12, padding: "6px 14px", color: "var(--text-muted)", fontSize: 16, cursor: "pointer" }}>←</button>
        <span style={{ fontSize: 20, fontWeight: 800, color: "var(--text)" }}>Transaction History</span>
      </div>

      {/* Transactions */}
      <div style={{ margin: "24px 16px 0", flex: 1 }}>
        {transactions.length === 0 ? (
          <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 16, padding: "40px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>No transactions yet</div>
            <div style={{ fontSize: 14, color: "var(--text-muted)" }}>Your transaction history will appear here</div>
          </div>
        ) : (
          <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
            {transactions.map((tx, i) => (
              <div key={tx.hash || i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: i < transactions.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Sent</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>To {tx.to?.slice(0, 6)}...{tx.to?.slice(-4)}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                    {new Date(tx.time).toLocaleString("en-IN")}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--red)" }}>-{tx.value} BNB</div>
                  <a href={`https://bscscan.com/tx/${tx.hash}`} target="_blank" style={{ fontSize: 11, color: "var(--accent)", textDecoration: "none" }}>
                    View on BSCScan →
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