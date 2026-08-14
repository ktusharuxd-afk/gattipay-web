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
import { ArrowUpRight, ArrowDownLeft, QrCode, ArrowLeftRight, Home, Wallet, Clock, User } from "lucide-react";
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
  const [theme, setTheme] = useState("light");
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
    abi: [
      {
        name: "balanceOf",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
      },
    ],
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    chainId: 56,
  });

  const wHONBalance = wHONRaw ? (Number(wHONRaw) / 1e18).toFixed(2) : "0.00";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch("/api/prices");
        const data = await res.json();
        setPrices({
          eth: data.ethereum?.inr || 0,
          bnb: data.binancecoin?.inr || 0,
          whon: 0,
        });
      } catch (e) {
        console.error("Price fetch failed", e);
      } finally {
        setLoadingPrices(false);
      }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null;
  const bnbVal = bnbBalance ? Number(bnbBalance.value) / 1e18 : 0;
  const totalINR = prices.bnb > 0 ? bnbVal * prices.bnb : 0;

  if (currentPage === "send") {
    return <SendPage onBack={() => {
      const saved = localStorage.getItem("gattipay_txns");
      if (saved) setTransactions(JSON.parse(saved));
      setCurrentPage("home");
    }} />;
  }
  if (currentPage === "receive") {
    return <ReceivePage onBack={() => setCurrentPage("home")} />;
  }
  if (currentPage === "scan") {
    return <ScanPage onBack={() => setCurrentPage("home")} onScan={() => setCurrentPage("send")} />;
  }
  if (currentPage === "swap") {
    return <SwapPage onBack={() => setCurrentPage("home")} />;
  }
  if (currentPage === "history") {
    return <HistoryPage onBack={() => setCurrentPage("home")} />;
  }
  if (currentPage === "profile") {
    return <ProfilePage onBack={() => setCurrentPage("home")} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)", overflow: "hidden", position: "relative", zIndex: 1 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px 0" }}>
        <span style={{ fontSize: 22, fontWeight: 900, color: "var(--accent)", letterSpacing: "-0.5px" }}>GattiPay</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setTheme(theme === "light" ? "dark" : "light")} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "6px 12px", color: "var(--text-muted)", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <button
            onClick={() => {
              const modal = document.querySelector('w3m-modal') as HTMLElement;
              if (modal) modal.removeAttribute('style');
              open({ view: isConnected ? "Account" : "Connect" });
            }}
            style={{ fontSize: 12, background: isConnected ? "var(--surface)" : "var(--accent)", border: "1px solid var(--border)", borderRadius: 12, padding: "6px 14px", color: isConnected ? "var(--green)" : "#0d1117", fontWeight: 700, cursor: "pointer" }}>
            {isConnected ? `● ${shortAddress}` : "Connect"}
          </button>
        </div>
      </div>

      {/* Balance Card */}
      <div style={{ margin: "16px 16px 0", background: "linear-gradient(135deg, var(--accent) 0%, #04b586 100%)", borderRadius: 20, padding: "24px 20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, background: "rgba(255,255,255,0.08)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: -20, left: -20, width: 80, height: 80, background: "rgba(255,255,255,0.05)", borderRadius: "50%" }} />
        <div style={{ color: "rgba(0,0,0,0.45)", fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Total balance</div>
        <div style={{ fontSize: 36, fontWeight: 900, color: "#0d1117", letterSpacing: "-1px", marginBottom: 14 }}>
          ₹{totalINR.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{ fontSize: 11, background: "rgba(0,0,0,0.1)", borderRadius: 8, padding: "4px 10px", color: "#0d1117", fontWeight: 600 }}>
            BNB {bnbVal.toFixed(4)}
          </span>
          <span style={{ fontSize: 11, background: "rgba(0,0,0,0.1)", borderRadius: 8, padding: "4px 10px", color: "#0d1117", fontWeight: 600 }}>
            wHON {wHONBalance}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "20px 16px 0", gap: 10 }}>
        {[
          { Icon: ArrowUpRight, label: "Send", action: () => setCurrentPage("send") },
          { Icon: ArrowDownLeft, label: "Receive", action: () => setCurrentPage("receive") },
          { Icon: QrCode, label: "Scan", action: () => setCurrentPage("scan") },
          { Icon: ArrowLeftRight, label: "Swap", action: () => setCurrentPage("swap") },
        ].map(({ Icon, label, action }) => (
          <button key={label} onClick={action} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "14px 0" }}>
            <Icon size={22} color="var(--accent)" strokeWidth={2.5} />
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>{label}</span>
          </button>
        ))}
      </div>

      {/* Live Prices */}
      <div style={{ padding: "16px 16px 0", flex: 1, display: "flex", flexDirection: "column", gap: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", marginBottom: 10, letterSpacing: 0.5 }}>LIVE PRICES</div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
          {[
            { name: "Ethereum", symbol: "ETH", price: prices.eth, dot: "#627EEA" },
            { name: "BNB", symbol: "BNB", price: prices.bnb, dot: "#F0B90B" },
            { name: "Wrapped HON", symbol: "wHON", price: prices.whon, dot: "#06d6a0" },
          ].map((coin, i) => (
            <div key={coin.symbol} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: i < 2 ? "1px solid var(--border)" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: coin.dot }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{coin.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{coin.symbol}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>
                {loadingPrices ? "..." : coin.price > 0 ? `₹${coin.price.toLocaleString("en-IN")}` : "—"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Tx Preview */}
      {transactions.length > 0 && (
        <div style={{ padding: "8px 16px 0" }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Last: <span style={{ fontWeight: 700, color: "var(--text)" }}>-{transactions[0].value} BNB</span>
            </div>
            <button onClick={() => setCurrentPage("history")} style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              View all →
            </button>
          </div>
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
                const modal = document.querySelector('w3m-modal') as HTMLElement;
                if (modal) modal.removeAttribute('style');
                open({ view: isConnected ? "Account" : "Connect" });
              } else {
                setCurrentPage(page);
              }
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