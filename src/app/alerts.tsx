"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Trash2, TrendingUp, TrendingDown, X, Bell } from "lucide-react";

interface Alert {
  id: string;
  coin: "ETH" | "BNB";
  targetPrice: number;
  direction: "above" | "below";
  triggered: boolean;
  createdAt: number;
}

interface AlertsPageProps {
  onBack: () => void;
}

export default function AlertsPage({ onBack }: AlertsPageProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newCoin, setNewCoin] = useState<"ETH" | "BNB">("BNB");
  const [newPrice, setNewPrice] = useState("");
  const [newDirection, setNewDirection] = useState<"above" | "below">("above");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("gattipay_price_alerts");
    if (saved) setAlerts(JSON.parse(saved));
  }, []);

  const saveAlerts = (updated: Alert[]) => {
    setAlerts(updated);
    localStorage.setItem("gattipay_price_alerts", JSON.stringify(updated));
  };

  const addAlert = () => {
    const price = parseFloat(newPrice);
    if (!price || price <= 0) { setError("Enter a valid price"); return; }
    const newAlert: Alert = {
      id: Date.now().toString(),
      coin: newCoin,
      targetPrice: price,
      direction: newDirection,
      triggered: false,
      createdAt: Date.now(),
    };
    saveAlerts([...alerts, newAlert]);
    setNewPrice(""); setError(""); setShowAdd(false);
  };

  const deleteAlert = (id: string) => {
    saveAlerts(alerts.filter(a => a.id !== id));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "8px", cursor: "pointer", display: "flex" }}>
            <ArrowLeft size={18} color="var(--text-secondary)" />
          </button>
          <span style={{ fontSize: 17, fontWeight: 800, color: "var(--text)" }}>Price Alerts</span>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ background: "var(--accent)", border: "none", borderRadius: 12, padding: "8px", cursor: "pointer", display: "flex" }}>
          <Plus size={18} color="#0a0e14" />
        </button>
      </div>

      <div style={{ flex: 1, padding: "0 16px", overflow: "auto" }}>
        {alerts.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bell size={28} color="var(--text-muted)" strokeWidth={1.5} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)" }}>No price alerts</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", maxWidth: 240 }}>Get notified when ETH or BNB hits your target price.</div>
            <button onClick={() => setShowAdd(true)} style={{ background: "var(--accent)", border: "none", borderRadius: 14, padding: "12px 24px", fontSize: 13, fontWeight: 800, color: "#0a0e14", cursor: "pointer", marginTop: 8 }}>+ Add Alert</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 8 }}>
            {alerts.map((a) => (
              <div key={a.id} style={{ background: "var(--surface)", border: `1px solid ${a.triggered ? "var(--accent)" : "var(--border)"}`, borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {a.direction === "above" ? <TrendingUp size={18} color="var(--green)" /> : <TrendingDown size={18} color="var(--red)" />}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{a.coin} {a.direction === "above" ? "≥" : "≤"} ₹{a.targetPrice.toLocaleString("en-IN")}</div>
                    <div style={{ fontSize: 11, color: a.triggered ? "var(--accent)" : "var(--text-muted)" }}>{a.triggered ? "Triggered" : "Active"}</div>
                  </div>
                </div>
                <button onClick={() => deleteAlert(a.id)} style={{ background: "rgba(244,63,94,0.1)", border: "none", borderRadius: 8, padding: 8, cursor: "pointer", display: "flex" }}>
                  <Trash2 size={14} color="var(--red)" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "var(--surface2)", border: "1px solid var(--border-light)", borderRadius: 24, padding: 24, width: "100%", maxWidth: 340 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: "var(--text)" }}>New Price Alert</span>
              <button onClick={() => { setShowAdd(false); setError(""); }} style={{ background: "var(--surface3)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", display: "flex" }}>
                <X size={16} color="var(--text-muted)" />
              </button>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {(["BNB", "ETH"] as const).map((c) => (
                <button key={c} onClick={() => setNewCoin(c)} style={{ flex: 1, background: newCoin === c ? "var(--accent)" : "var(--surface3)", border: "none", borderRadius: 12, padding: "10px", fontSize: 13, fontWeight: 800, color: newCoin === c ? "#0a0e14" : "var(--text-secondary)", cursor: "pointer" }}>{c}</button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {([{ v: "above", label: "Goes Above ↑" }, { v: "below", label: "Goes Below ↓" }] as const).map((d) => (
                <button key={d.v} onClick={() => setNewDirection(d.v)} style={{ flex: 1, background: newDirection === d.v ? "var(--accent-dim)" : "var(--surface3)", border: newDirection === d.v ? "1px solid var(--accent)" : "1px solid transparent", borderRadius: 12, padding: "10px", fontSize: 12, fontWeight: 700, color: newDirection === d.v ? "var(--accent)" : "var(--text-secondary)", cursor: "pointer" }}>{d.label}</button>
              ))}
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6 }}>Target Price (₹)</div>
            <input value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="e.g. 65000" type="number" style={{ width: "100%", background: "var(--surface3)", border: "1px solid var(--border-light)", borderRadius: 12, padding: "12px 14px", fontSize: 16, fontWeight: 800, color: "var(--text)", outline: "none", marginBottom: error ? 6 : 16 }} />
            {error && <div style={{ fontSize: 11, color: "var(--red)", marginBottom: 16, fontWeight: 600 }}>{error}</div>}

            <button onClick={addAlert} style={{ width: "100%", background: "var(--accent)", border: "none", borderRadius: 14, padding: "14px", fontSize: 14, fontWeight: 800, color: "#0a0e14", cursor: "pointer" }}>Create Alert</button>
          </div>
        </div>
      )}
    </div>
  );
}