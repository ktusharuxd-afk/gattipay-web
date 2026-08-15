"use client";
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'appkit-button': { size?: string; label?: string; };
    }
  }
}
import { useState, useEffect } from "react";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useBalance, useReadContract } from "wagmi";
import { ArrowUpRight, ArrowDownLeft, QrCode, ArrowLeftRight, Home, Wallet, Clock, User, Bell, ChevronRight } from "lucide-react";
import SendPage from "./send";
import ReceivePage from "./receive";
import ScanPage from "./scan";
import SwapPage from "./swap";
import HistoryPage from "./history";
import ProfilePage from "./profile";

interface Prices {
  eth: number;
  bnb: number;
  whon: number;
}

export default function HomePage() {
  const [prices, setPrices] = useState<Prices>({ eth: 0, bnb: 0, whon: 0 });
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [currentPage, setCurrentPage] = useState("home");
  const [transactions, setTransactions] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("gattipay_txns");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  const { data: bnbBalance } = useBalance({
    address: address as `0x${string}`,
    chainId: 56,
  });

  const { data: wHONRaw } = useReadContract({
    address: "0x0A1Ac7aE511cEcE9493602815A11d1c53b253518",
    abi: [{
      name: "balanceOf", type: "function", stateMutability: "view",
      inputs: [{ name: "account", type: "address" }],
      outputs: [{ name: "", type: "uint256" }],
    }],
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    chainId: 56,
  });

  const wHONBalance = wHONRaw ? (Number(wHONRaw) / 1e18).toFixed(2) : "0.00";

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch("/api/prices");
        const data = await res.json();
        setPrices({ eth: data.ethereum?.inr || 0, bnb: data.binancecoin?.inr || 0, whon: 0 });
      } catch {} finally { setLoadingPrices(false); }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const bnbVal = bnbBalance ? Number(bnbBalance.value) / 1e18 : 0;
  const totalINR = prices.bnb > 0 ? bnbVal * prices.bnb : 0;
  const shortAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
  const pctChange = "+0.00%";

  if (currentPage === "send") return <SendPage onBack={() => { const s = localStorage.getItem("gattipay_txns"); if (s) setTransactions(JSON.parse(s)); setCurrentPage("home"); }} />;
  if (currentPage === "receive") return <ReceivePage onBack={() => setCurrentPage("home")} />;
  if (currentPage === "scan") return <ScanPage onBack={() => setCurrentPage("home")} onScan={() => setCurrentPage("send")} />;
  if (currentPage === "swap") return <SwapPage onBack={() => setCurrentPage("home")} />;
  if (currentPage === "history") return <HistoryPage onBack={() => setCurrentPage("home")} />;
  if (currentPage === "profile") return <ProfilePage onBack={() => setCurrentPage("home")} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)", overflow: "hidden", position: "relative", zIndex: 1 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 16, fontWeight: 900, color: "var(--accent)" }}>G</span>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>GattiPay</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{isConnected ? shortAddr : "Not connected"}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "8px", cursor: "pointer", display: "flex", position: "relative" }}>
            <Bell size={18} color="var(--text-secondary)" />
            <div style={{ position: "absolute", top: 6, right: 6, width: 6, height: 6, background: "var(--accent)", borderRadius: "50%" }} />
          </button>
          <button
            onClick={() => { const m = document.querySelector('w3m-modal') as HTMLElement; if (m) m.removeAttribute('style'); open({ view: isConnected ? "Account" : "Connect" }); }}
            style={{ background: isConnected ? "var(--accent-dim)" : "var(--accent)", border: "none", borderRadius: 12, padding: "8px 14px", fontSize: 12, fontWeight: 700, color: isConnected ? "var(--accent)" : "#0a0e14", cursor: "pointer" }}>
            {isConnected ? "● Connected" : "Connect"}
          </button>
        </div>
      </div>

      {/* Balance Card */}
      <div style={{ margin: "16px 16px 0", background: "linear-gradient(145deg, var(--surface) 0%, var(--surface2) 100%)", border: "1px solid var(--border)", borderRadius: 24, padding: "22px 20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, background: "var(--accent-glow)", borderRadius: "50%", filter: "blur(60px)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>My Balance</div>
          <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700 }}>{pctChange}</div>
        </div>
        <div style={{ fontSize: 38, fontWeight: 900, color: "var(--text)", letterSpacing: "-2px", marginBottom: 16, position: "relative" }}>
          ₹{totalINR.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ background: "var(--surface3)", borderRadius: 10, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#F0B90B" }} />
            <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>BNB {bnbVal.toFixed(4)}</span>
          </div>
          <div style={{ background: "var(--surface3)", borderRadius: 10, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }} />
            <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>wHON {wHONBalance}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: "flex", gap: 10, padding: "16px 16px 0" }}>
        {[
          { Icon: ArrowUpRight, label: "Send", page: "send", color: "var(--accent)" },
          { Icon: ArrowDownLeft, label: "Receive", page: "receive", color: "var(--accent)" },
          { Icon: QrCode, label: "Scan", page: "scan", color: "var(--accent)" },
          { Icon: ArrowLeftRight, label: "Swap", page: "swap", color: "var(--accent)" },
        ].map(({ Icon, label, page, color }) => (
          <button key={label} onClick={() => setCurrentPage(page)} style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "16px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <div style={{ width: 42, height: 42, background: "var(--accent-dim)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon size={20} color={color} strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>{label}</span>
          </button>
        ))}
      </div>

      {/* Live Prices */}
      <div style={{ padding: "16px 16px 0", flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", letterSpacing: 0.5 }}>LIVE PRICES</span>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
          {[
            { name: "Ethereum", symbol: "ETH", price: prices.eth, color: "#627EEA" },
            { name: "BNB", symbol: "BNB", price: prices.bnb, color: "#F0B90B" },
            { name: "Wrapped HON", symbol: "wHON", price: prices.whon, color: "var(--accent)" },
          ].map((coin, i) => (
            <div key={coin.symbol} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: i < 2 ? "1px solid var(--border)" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: `${coin.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: coin.color }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{coin.name}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{coin.symbol}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>
                {loadingPrices ? "..." : coin.price > 0 ? `₹${coin.price.toLocaleString("en-IN")}` : "—"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transaction */}
      {transactions.length > 0 && (
        <div style={{ padding: "8px 16px 0" }}>
          <button onClick={() => setCurrentPage("history")} style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(244,63,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ArrowUpRight size={14} color="var(--red)" />
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>-{transactions[0].value} BNB</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>To {transactions[0].to?.slice(0, 6)}...{transactions[0].to?.slice(-4)}</div>
              </div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </button>
        </div>
      )}

      {/* Bottom Nav */}
      <div style={{ display: "flex", justifyContent: "space-around", padding: "12px 0 20px", borderTop: "1px solid var(--border)", marginTop: 12, background: "var(--bg)" }}>
        {[
          { Icon: Home, label: "Home", page: "home" },
          { Icon: Wallet, label: "Wallet", page: "wallet" },
          { Icon: Clock, label: "History", page: "history" },
          { Icon: User, label: "Profile", page: "profile" },
        ].map(({ Icon, label, page }) => {
          const isActive = currentPage === page;
          return (
            <button key={label} onClick={() => {
              if (page === "wallet") {
                const m = document.querySelector('w3m-modal') as HTMLElement;
                if (m) m.removeAttribute('style');
                open({ view: isConnected ? "Account" : "Connect" });
              } else setCurrentPage(page);
            }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer", background: "none", border: "none", padding: "4px 16px" }}>
              <Icon size={20} color={isActive ? "var(--accent)" : "var(--text-muted)"} strokeWidth={isActive ? 2.5 : 1.5} />
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? "var(--accent)" : "var(--text-muted)" }}>{label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
}