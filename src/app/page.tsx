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
import { ArrowUpRight, ArrowDownLeft, QrCode, ArrowLeftRight, Home, Wallet, Clock, User, ChevronDown } from "lucide-react";
import SendPage from "./send";
import ReceivePage from "./receive";
import ScanPage from "./scan";
import SwapPage from "./swap";
import HistoryPage from "./history";
import ProfilePage from "./profile";
import SplashScreen from "./splash";

interface Prices { eth: number; bnb: number; whon: number; }

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window !== "undefined") {
      return !localStorage.getItem("gattipay_onboarded");
    }
    return false;
  });
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

  const { data: bnbBalance } = useBalance({ address: address as `0x${string}`, chainId: 56 });
  const { data: wHONRaw } = useReadContract({
    address: "0x0A1Ac7aE511cEcE9493602815A11d1c53b253518",
    abi: [{ name: "balanceOf", type: "function", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }] }],
    functionName: "balanceOf", args: [address as `0x${string}`], chainId: 56,
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

  const openModal = () => {
    const m = document.querySelector('w3m-modal') as HTMLElement;
    if (m) m.removeAttribute('style');
    open({ view: isConnected ? "Account" : "Connect" });
  };

  if (showSplash) return <SplashScreen onComplete={() => setShowSplash(false)} />;
  if (currentPage === "send") return <div className="page-enter"><SendPage onBack={() => { const s = localStorage.getItem("gattipay_txns"); if (s) setTransactions(JSON.parse(s)); setCurrentPage("home"); }} /></div>;
  if (currentPage === "receive") return <div className="page-enter"><ReceivePage onBack={() => setCurrentPage("home")} /></div>;
  if (currentPage === "scan") return <div className="page-enter"><ScanPage onBack={() => setCurrentPage("home")} onScan={() => setCurrentPage("send")} /></div>;
  if (currentPage === "swap") return <div className="page-enter"><SwapPage onBack={() => setCurrentPage("home")} /></div>;
  if (currentPage === "history") return <div className="page-enter"><HistoryPage onBack={() => setCurrentPage("home")} /></div>;
  if (currentPage === "profile") return <div className="page-enter"><ProfilePage onBack={() => setCurrentPage("home")} /></div>;

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)", overflow: "hidden", position: "relative", zIndex: 1 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px 0" }}>
        <button onClick={openModal} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--surface3)", border: "1.5px solid var(--border-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={16} color="var(--text-secondary)" />
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 3 }}>
              {isConnected ? shortAddr : "Connect Wallet"}
              <ChevronDown size={12} color="var(--text-muted)" />
            </div>
            <div style={{ fontSize: 10, color: isConnected ? "var(--accent)" : "var(--text-muted)", fontWeight: 600 }}>
              {isConnected ? "● BNB Smart Chain" : "Tap to connect"}
            </div>
          </div>
        </button>
      </div>

      {/* Balance + Actions Card */}
      <div style={{ margin: "14px 16px 0", background: "linear-gradient(145deg, var(--surface) 0%, var(--surface2) 100%)", border: "1px solid var(--border)", borderRadius: 24, padding: "20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 160, height: 160, background: "var(--accent-glow)", borderRadius: "50%", filter: "blur(70px)", pointerEvents: "none" }} />
        
        {/* Balance */}
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Total Balance</div>
            <div style={{ fontSize: 10, color: "var(--accent)", fontWeight: 700, background: "var(--accent-dim)", padding: "2px 8px", borderRadius: 6 }}>+0.00%</div>
          </div>
          <div style={{ fontSize: 34, fontWeight: 900, color: "var(--text)", letterSpacing: "-1.5px", marginBottom: 12 }}>
            ₹{totalINR.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <div style={{ background: "var(--surface3)", border: "1px solid var(--border-light)", borderRadius: 10, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#F0B90B", flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 700 }}>BNB {bnbVal.toFixed(4)}</span>
            </div>
            <div style={{ background: "var(--surface3)", border: "1px solid var(--border-light)", borderRadius: 10, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 700 }}>wHON {wHONBalance}</span>
            </div>
          </div>
        </div>

        {/* Integrated Actions */}
        <div style={{ display: "flex", gap: 8, position: "relative" }}>
          {[
            { Icon: ArrowUpRight, label: "Send", page: "send" },
            { Icon: ArrowDownLeft, label: "Receive", page: "receive" },
            { Icon: QrCode, label: "Scan", page: "scan" },
            { Icon: ArrowLeftRight, label: "Swap", page: "swap" },
          ].map(({ Icon, label, page }) => (
            <button key={label} onClick={() => setCurrentPage(page)} style={{
              flex: 1, background: "var(--surface3)", border: "1px solid var(--border-light)",
              borderRadius: 14, padding: "12px 0",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer",
              transition: "background 0.15s"
            }}>
              <Icon size={18} color="var(--accent)" strokeWidth={2.5} />
              <span style={{ fontSize: 10, color: "var(--text-secondary)", fontWeight: 600 }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Live Prices — Lines style */}
      <div style={{ padding: "16px 16px 0", flex: 1, minHeight: 0, overflow: "auto" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 0.8, marginBottom: 14 }}>LIVE PRICES</div>
        {[
          { name: "Ethereum", symbol: "ETH", price: prices.eth, color: "#627EEA" },
          { name: "BNB", symbol: "BNB", price: prices.bnb, color: "#F0B90B" },
          { name: "Wrapped HON", symbol: "wHON", price: prices.whon, color: "var(--accent)" },
        ].map((coin, i) => (
          <div key={coin.symbol}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: `${coin.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: coin.color }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{coin.name}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 500 }}>{coin.symbol}</div>
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: coin.price > 0 ? "var(--text)" : "var(--text-muted)" }}>
                {loadingPrices ? "..." : coin.price > 0 ? `₹${coin.price.toLocaleString("en-IN")}` : "—"}
              </div>
            </div>
            {i < 2 && <div style={{ height: 1, background: "var(--border)", marginLeft: 44 }} />}
          </div>
        ))}
      </div>

      {/* Floating Bottom Nav */}
      <div style={{ padding: "0 20px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-around", padding: "10px 0", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20 }}>
          {[
            { Icon: Home, label: "Home", page: "home" },
            { Icon: Wallet, label: "Wallet", page: "wallet" },
            { Icon: Clock, label: "History", page: "history" },
            { Icon: User, label: "Profile", page: "profile" },
          ].map(({ Icon, label, page }) => {
            const isActive = currentPage === page;
            return (
              <button key={label} onClick={() => { if (page === "wallet") openModal(); else setCurrentPage(page); }} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                cursor: "pointer", background: isActive ? "var(--accent)" : "none",
                border: "none", padding: isActive ? "8px 16px" : "8px 16px",
                borderRadius: isActive ? 14 : 0,
                transition: "all 0.2s ease"
              }}>
                <Icon size={19} color={isActive ? "#0a0e14" : "var(--text-muted)"} strokeWidth={isActive ? 2.5 : 1.5} />
                <span style={{ fontSize: 9, fontWeight: isActive ? 800 : 500, color: isActive ? "#0a0e14" : "var(--text-muted)" }}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}