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
import { ArrowUpRight, ArrowDownLeft, ArrowLeft, QrCode, ArrowLeftRight, Home, Wallet, Clock, User, ChevronDown, Bell } from "lucide-react";
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
    if (typeof window !== "undefined") return !localStorage.getItem("gattipay_onboarded");
    return false;
  });
  const [prices, setPrices] = useState<Prices>({ eth: 0, bnb: 0, whon: 0 });
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [currentPage, setCurrentPage] = useState("home");
  const [prevPage, setPrevPage] = useState("home");
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

  const goTo = (page: string) => {
    setPrevPage(currentPage);
    if (page === "home") {
      const s = localStorage.getItem("gattipay_txns");
      if (s) setTransactions(JSON.parse(s));
    }
    setCurrentPage(page);
  };

  if (showSplash) return <SplashScreen onComplete={() => setShowSplash(false)} />;

  // Full-screen pages (Send, Receive, Scan, Swap)
  if (currentPage === "send") return <div key="send" className="page-enter"><SendPage onBack={() => goTo("home")} /></div>;
  if (currentPage === "receive") return <div key="receive" className="page-enter"><ReceivePage onBack={() => goTo("home")} /></div>;
  if (currentPage === "scan") return <div key="scan" className="page-enter"><ScanPage onBack={() => goTo("home")} onScan={() => goTo("send")} /></div>;
  if (currentPage === "swap") return <div key="swap" className="page-enter"><SwapPage onBack={() => goTo("home")} /></div>;

  // Bottom nav
  const bottomNav = (
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
            <button key={label} onClick={() => goTo(page)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              cursor: "pointer", background: isActive ? "var(--accent)" : "none",
              border: "none", padding: "8px 16px",
              borderRadius: isActive ? 14 : 0, transition: "all 0.25s ease"
            }}>
              <Icon size={19} color={isActive ? "#0a0e14" : "var(--text-muted)"} strokeWidth={isActive ? 2.5 : 1.5} />
              <span style={{ fontSize: 9, fontWeight: isActive ? 800 : 500, color: isActive ? "#0a0e14" : "var(--text-muted)" }}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // Wallet page
  if (currentPage === "wallet") {
    return (
      <div key="wallet" className="page-enter" style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px" }}>
          <button onClick={() => goTo("home")} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "8px", cursor: "pointer", display: "flex" }}>
            <ArrowLeft size={18} color="var(--text-secondary)" />
          </button>
          <span style={{ fontSize: 17, fontWeight: 800, color: "var(--text)" }}>Wallet</span>
        </div>
        
        <div style={{ flex: 1, padding: "0 16px", overflow: "auto" }}>
          {!isConnected ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 20 }}>
              <div style={{ width: 80, height: 80, borderRadius: 24, background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Wallet size={36} color="var(--accent)" strokeWidth={1.5} />
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "var(--text)" }}>Connect Your Wallet</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", maxWidth: 260, lineHeight: 1.7 }}>Connect MetaMask, Trust Wallet or any of 380+ wallets to get started.</div>
              <button onClick={openModal} style={{ background: "var(--accent)", border: "none", borderRadius: 16, padding: "16px 48px", fontSize: 15, fontWeight: 800, color: "#0a0e14", cursor: "pointer", boxShadow: "0 0 30px var(--accent-glow)" }}>
                Connect Wallet
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Connected Wallet */}
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 0.8, marginTop: 4 }}>CONNECTED WALLET</div>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="" style={{ width: 32, height: 32 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>MetaMask</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>{shortAddr}</div>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: "var(--accent)", fontWeight: 700, background: "var(--accent-dim)", padding: "4px 10px", borderRadius: 8 }}>● Connected</div>
              </div>

              {/* Network */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>Network</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F0B90B" }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>BNB Smart Chain</span>
                </div>
              </div>

              {/* Add Another Wallet */}
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 0.8, marginTop: 8 }}>ADD WALLET</div>
              <button onClick={openModal} style={{ width: "100%", background: "var(--surface)", border: "1px dashed var(--border-light)", borderRadius: 16, padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Wallet size={20} color="var(--accent)" />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>Connect Another Wallet</span>
              </button>

              {/* GattiPay Wallet (Coming Soon) */}
              <button style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", opacity: 0.6 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 18, fontWeight: 900, color: "var(--accent)" }}>G</span>
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>GattiPay Wallet</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Coming Soon</div>
                </div>
              </button>

              {/* Manage */}
              <button onClick={openModal} style={{ width: "100%", background: "var(--surface3)", border: "1px solid var(--border-light)", borderRadius: 14, padding: "14px", fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", cursor: "pointer", textAlign: "center", marginTop: 4 }}>
                Manage Wallet Settings
              </button>
            </div>
          )}
        </div>

        {bottomNav}
      </div>
    );
  }
    

  // History page (with nav)
  if (currentPage === "history") {
    return (
      <div key="history" className="page-enter" style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px" }}>
          <button onClick={() => goTo("home")} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "8px", cursor: "pointer", display: "flex" }}>
            <ArrowLeft size={18} color="var(--text-secondary)" />
          </button>
          <span style={{ fontSize: 17, fontWeight: 800, color: "var(--text)" }}>History</span>
        </div>
        <div style={{ flex: 1, overflow: "auto" }}>
          <HistoryPage onBack={() => goTo("home")} />
        </div>
        {bottomNav}
      </div>
    );
  }

  // Profile page (with nav)
  if (currentPage === "profile") {
    return (
      <div key="home" className="page-enter" style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)" }}>
        <div style={{ flex: 1, overflow: "auto" }}>
          <ProfilePage onBack={() => goTo("home")} />
        </div>
        {bottomNav}
      </div>
    );
  }

  // Home page
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
          <button onClick={() => goTo("history")} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "9px", cursor: "pointer", display: "flex", position: "relative" }}>
            <Bell size={17} color="var(--text-secondary)" />
            {transactions.length > 0 && <div style={{ position: "absolute", top: 6, right: 6, width: 6, height: 6, background: "var(--accent)", borderRadius: "50%" }} />}
          </button>
        </div>

      {/* Balance Card */}
      <div style={{ margin: "14px 16px 0", background: "linear-gradient(145deg, var(--surface) 0%, var(--surface2) 100%)", border: "1px solid var(--border)", borderRadius: 24, padding: "20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 160, height: 160, background: "var(--accent-glow)", borderRadius: "50%", filter: "blur(70px)", pointerEvents: "none" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, position: "relative" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Total Balance</div>
          <button onClick={openModal} style={{ fontSize: 10, fontWeight: 700, padding: "5px 14px", borderRadius: 10, border: "none", cursor: "pointer", background: isConnected ? "var(--accent-dim)" : "var(--accent)", color: isConnected ? "var(--accent)" : "#0a0e14", boxShadow: isConnected ? "none" : "0 0 20px var(--accent-glow)", transition: "all 0.3s", display: "flex", alignItems: "center", gap: 6 }}>
            {isConnected ? (
              <>
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="" style={{ width: 14, height: 14 }} />
                {shortAddr}
              </>
            ) : "Connect Wallet"}
          </button>
        </div>
        <div style={{ fontSize: 34, fontWeight: 900, color: "var(--text)", letterSpacing: "-1.5px", marginBottom: 12, position: "relative" }}>
          ₹{totalINR.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 18, position: "relative", flexWrap: "wrap" }}>
          <div style={{ background: "var(--surface3)", border: "1px solid var(--border-light)", borderRadius: 10, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#F0B90B", flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 700 }}>BNB {bnbVal.toFixed(4)}</span>
          </div>
          <div style={{ background: "var(--surface3)", border: "1px solid var(--border-light)", borderRadius: 10, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 700 }}>wHON {wHONBalance}</span>
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
            <button key={label} onClick={() => goTo(page)} style={{ flex: 1, background: "var(--surface3)", border: "1px solid var(--border-light)", borderRadius: 14, padding: "12px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <Icon size={18} color="var(--accent)" strokeWidth={2.5} />
              <span style={{ fontSize: 10, color: "var(--text-secondary)", fontWeight: 600 }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Live Prices */}
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

      {bottomNav}
    </div>
  );
}