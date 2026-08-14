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
import SendPage from "./send";
import ReceivePage from "./receive";
import ScanPage from "./scan";
import SwapPage from "./swap";

interface Prices {
  eth: number;
  bnb: number;
  whon: number;
}

export default function Home() {
  const [theme, setTheme] = useState("light");
  const [prices, setPrices] = useState<Prices>({ eth: 0, bnb: 0, whon: 0 });
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [currentPage, setCurrentPage] = useState("home");
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const [transactions, setTransactions] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("gattipay_txns");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
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

  const wHONBalance = wHONRaw ? (Number(wHONRaw) / 1e18).toFixed(4) : "0.0000";
  
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
  



  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  const formatINR = (n: number) =>
    n > 0 ? `₹${n.toLocaleString("en-IN")}` : "—";

 if (currentPage === "send") {
    return <SendPage onBack={() => setCurrentPage("home")} />;
  }

  if (currentPage === "receive") {
    return <ReceivePage onBack={() => setCurrentPage("home")} />;
  }

  if (currentPage === "scan") {
    return <ScanPage onBack={() => setCurrentPage("home")} onScan={(addr) => { setCurrentPage("send"); }} />;
  }

  if (currentPage === "swap") {
    return <SwapPage onBack={() => setCurrentPage("home")} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)", position: "relative", zIndex: 1 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 20px 0" }}>
        <span style={{ fontSize: 24, fontWeight: 800, color: "var(--accent)", letterSpacing: "-0.5px" }}>GattiPay</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={toggleTheme} style={{ background: "none", border: "1.5px solid var(--border)", borderRadius: 20, padding: "5px 14px", color: "var(--text-muted)", fontSize: 12, cursor: "pointer" }}>
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
          <button 
            onClick={() => { 
              const modal = document.querySelector('w3m-modal') as HTMLElement;
              if (modal) {
                modal.removeAttribute('style');
              }
              open({ view: isConnected ? "Account" : "Connect" });
            }}
            style={{ fontSize: 12, background: isConnected ? "var(--surface2)" : "var(--accent)", border: "1.5px solid var(--border)", borderRadius: 20, padding: "5px 12px", color: isConnected ? "var(--green)" : "#0d1117", fontWeight: 600, cursor: "pointer" }}>
            {isConnected ? `● ${shortAddress}` : "Connect Wallet"}
          </button>
        </div>
      </div>

      {/* Balance Card */}
      <div style={{ margin: "24px 16px 0", background: "var(--accent)", borderRadius: 24, padding: "28px 24px" }}>
        <div style={{ color: "rgba(0,0,0,0.5)", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Total balance</div>
        <div style={{ fontSize: 42, fontWeight: 800, color: "#0d1117", marginBottom: 20, letterSpacing: "-1px" }}>
          {isConnected && bnbBalance && prices.bnb > 0
            ? `₹${(parseFloat(String(Number(bnbBalance.value) / 1e18)) * prices.bnb).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
            : "₹0.00"}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, background: "rgba(0,0,0,0.12)", borderRadius: 20, padding: "4px 12px", color: "#0d1117", fontWeight: 500 }}>
            BNB {bnbBalance ? parseFloat(String(Number(bnbBalance.value) / 1e18)).toFixed(4) : "0.0000"}
          </span>
          <span style={{ fontSize: 12, background: "rgba(0,0,0,0.12)", borderRadius: 20, padding: "4px 12px", color: "#0d1117", fontWeight: 500 }}>
            wHON {wHONBalance}
          </span>
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
      <div style={{ display: "flex", justifyContent: "space-around", margin: "28px 16px", position: "relative", zIndex: 10 }}>
        {[
          { icon: "↑", label: "Send", action: () => setCurrentPage("send") },
          { icon: "↓", label: "Receive", action: () => setCurrentPage("receive") },
          { icon: "⊙", label: "Scan", action: () => setCurrentPage("scan") },
          { icon: "⇄", label: "Swap", action: () => setCurrentPage("swap") },
        ].map((action) => (
          <button key={action.label} onClick={action.action} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer", background: "none", border: "none", padding: 0 }}>
            <div style={{ width: 60, height: 60, background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "var(--accent)" }}>
              {action.icon}
            </div>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{action.label}</span>
          </button>
        ))}
      </div>

      {/* Live Prices */}
      <div style={{ margin: "0 16px 24px" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>Live prices</div>
        <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
          {[
            { label: "Ethereum", symbol: "ETH", price: prices.eth },
            { label: "BNB", symbol: "BNB", price: prices.bnb },
            { label: "Wrapped HON", symbol: "wHON", price: prices.whon },
          ].map((coin, i) => (
            <div key={coin.symbol} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: i < 2 ? "1px solid var(--border)" : "none" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{coin.label}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{coin.symbol}</div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--accent)" }}>
                {loadingPrices ? "Loading..." : formatINR(coin.price)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ flex: 1, margin: "0 16px" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>Recent activity</div>
        <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
          {transactions.length === 0 ? (
            <div style={{ padding: "20px", color: "var(--text-muted)", fontSize: 14, textAlign: "center" }}>
              No transactions yet
            </div>
          ) : (
            transactions.map((tx, i) => {
              const isSent = tx.from?.toLowerCase() === address?.toLowerCase();
              const amount = (Number(tx.value) / 1e18).toFixed(4);
              const shortAddr = isSent
                ? `${tx.to?.slice(0, 6)}...${tx.to?.slice(-4)}`
                : `${tx.from?.slice(0, 6)}...${tx.from?.slice(-4)}`;
              return (
                <div key={tx.hash || i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: i < transactions.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{isSent ? "Sent" : "Received"}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{isSent ? `To ${shortAddr}` : `From ${shortAddr}`}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: isSent ? "var(--red)" : "var(--green)" }}>
                    -{tx.value} BNB
                  </div>
                </div>
              );
            })
          )}
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