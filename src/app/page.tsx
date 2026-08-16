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
import { Wallet as EthersWallet } from "ethers";
import { ArrowUpRight, ArrowDownLeft, ArrowLeft, QrCode, ArrowLeftRight, Home, Wallet, Clock, User, ChevronDown, Bell, Check, Lock, X, ShieldAlert, KeyRound, ShieldCheck } from "lucide-react";
import SendPage from "./send";
import ReceivePage from "./receive";
import ScanPage from "./scan";
import SwapPage from "./swap";
import HistoryPage from "./history";
import ProfilePage from "./profile";
import SplashScreen from "./splash";
import GattiWalletPage from "./gattiwallet";

interface Prices { eth: number; bnb: number; whon: number; }
interface Notif { id: string; title: string; subtitle: string; time: number; type: "security" | "info"; }

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window !== "undefined") return !localStorage.getItem("gattipay_onboarded");
    return false;
  });
  const [prices, setPrices] = useState<Prices>({ eth: 0, bnb: 0, whon: 0 });
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [currentPage, setCurrentPage] = useState("home");
  const [prevPage, setPrevPage] = useState("home");
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifications, setNotifications] = useState<Notif[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("gattipay_notifications");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [showGattiWallet, setShowGattiWallet] = useState(false);
  const [gattiWalletData, setGattiWalletData] = useState<any>(null);
  const [activeWallet, setActiveWallet] = useState<"external" | "gatti">("external");
  const [gattiPrivateKey, setGattiPrivateKey] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState<number | null>(null);
  const [resetMode, setResetMode] = useState(false);
  const [resetSeed, setResetSeed] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [transactions, setTransactions] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("gattipay_txns");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  useEffect(() => {
    const saved = localStorage.getItem("gattipay_own_wallet");
    if (saved) setGattiWalletData(JSON.parse(saved));
    const lockData = localStorage.getItem("gattipay_lock");
    if (lockData) {
      const parsed = JSON.parse(lockData);
      if (parsed.lockUntil && parsed.lockUntil > Date.now()) setLockUntil(parsed.lockUntil);
      setFailedAttempts(parsed.attempts || 0);
    }
  }, [showGattiWallet]);

  const addNotification = (title: string, subtitle: string, type: "security" | "info" = "security") => {
    const notif: Notif = { id: Date.now().toString(), title, subtitle, time: Date.now(), type };
    const updated = [notif, ...notifications].slice(0, 20);
    setNotifications(updated);
    localStorage.setItem("gattipay_notifications", JSON.stringify(updated));
  };

  const activeAddress = activeWallet === "gatti" && gattiWalletData ? gattiWalletData.address : address;

  const { data: bnbBalance } = useBalance({ address: activeAddress as `0x${string}`, chainId: 56 });
  const { data: wHONRaw } = useReadContract({
    address: "0x0A1Ac7aE511cEcE9493602815A11d1c53b253518",
    abi: [{ name: "balanceOf", type: "function", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }] }],
    functionName: "balanceOf", args: [activeAddress as `0x${string}`], chainId: 56,
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.wallet-dropdown-container')) setShowWalletDropdown(false);
      if (!target.closest('.notif-dropdown-container')) setShowNotifDropdown(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const bnbVal = bnbBalance ? Number(bnbBalance.value) / 1e18 : 0;
  const totalINR = prices.bnb > 0 ? bnbVal * prices.bnb : 0;
  const shortAddr = activeAddress ? `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}` : "";

  const openModal = () => {
    const m = document.querySelector('w3m-modal') as HTMLElement;
    if (m) m.removeAttribute('style');
    open({ view: isConnected ? "Account" : "Connect" });
  };

  const openConnectModal = () => {
    const m = document.querySelector('w3m-modal') as HTMLElement;
    if (m) m.removeAttribute('style');
    open({ view: "Connect" });
  };

  const goTo = (page: string) => {
    setPrevPage(currentPage);
    if (page === "home") {
      const s = localStorage.getItem("gattipay_txns");
      if (s) setTransactions(JSON.parse(s));
    }
    setCurrentPage(page);
  };

  const unlockGattiWallet = () => {
    if (!gattiWalletData) {
      setShowWalletDropdown(false);
      setShowGattiWallet(true);
      return;
    }
    setShowWalletDropdown(false);
    setShowPasswordModal(true);
    setPasswordInput("");
    setPasswordError("");
    setResetMode(false);
  };

  const confirmUnlock = () => {
    if (lockUntil && lockUntil > Date.now()) {
      const mins = Math.ceil((lockUntil - Date.now()) / 60000);
      setPasswordError(`Too many attempts. Try again in ${mins} min.`);
      return;
    }
    if (btoa(passwordInput) !== gattiWalletData.passwordHash) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      if (newAttempts >= 3) {
        const lock = Date.now() + 5 * 60000;
        setLockUntil(lock);
        localStorage.setItem("gattipay_lock", JSON.stringify({ attempts: 0, lockUntil: lock }));
        setPasswordError("Too many failed attempts. Locked for 5 minutes.");
        addNotification("Wallet locked", "3 failed unlock attempts detected. Locked for 5 minutes.", "security");
      } else {
        localStorage.setItem("gattipay_lock", JSON.stringify({ attempts: newAttempts, lockUntil: null }));
        setPasswordError(`Incorrect password. ${3 - newAttempts} attempt(s) left.`);
      }
      return;
    }
    setFailedAttempts(0);
    localStorage.removeItem("gattipay_lock");
    try {
      const mnemonic = atob(gattiWalletData.encryptedMnemonic);
      const wallet = EthersWallet.fromPhrase(mnemonic);
      setGattiPrivateKey(wallet.privateKey);
      setActiveWallet("gatti");
      setShowPasswordModal(false);
      setPasswordInput("");
    } catch {
      setPasswordError("Failed to unlock wallet");
    }
  };

  const confirmReset = () => {
    setResetError("");
    try {
      const wallet = EthersWallet.fromPhrase(resetSeed.trim());
      if (wallet.address.toLowerCase() !== gattiWalletData.address.toLowerCase()) {
        setResetError("This recovery phrase doesn't match your wallet.");
        return;
      }
      if (newPassword.length < 6) {
        setResetError("Password must be at least 6 characters");
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setResetError("Passwords don't match");
        return;
      }
      const history = gattiWalletData.passwordHistory || [gattiWalletData.passwordHash];
      if (history.includes(btoa(newPassword))) {
        setResetError("You've used this password before. Please choose a new one.");
        return;
      }
      const updatedHistory = [btoa(newPassword), ...history].slice(0, 10);
      const updated = { ...gattiWalletData, passwordHash: btoa(newPassword), passwordHistory: updatedHistory };
      localStorage.setItem("gattipay_own_wallet", JSON.stringify(updated));
      setGattiWalletData(updated);
      localStorage.removeItem("gattipay_lock");
      setFailedAttempts(0);
      setLockUntil(null);
      setResetSeed("");
      setNewPassword("");
      setConfirmNewPassword("");
      setResetError("__SUCCESS__");
      addNotification("Password reset", "Your GattiPay Wallet password was reset using your recovery phrase.", "security");
      setTimeout(() => {
        setShowPasswordModal(false);
        setResetMode(false);
        setResetError("");
      }, 2000);
    } catch {
      setResetError("Invalid recovery phrase");
    }
  };

  const switchToExternal = () => {
    setActiveWallet("external");
    setGattiPrivateKey(null);
    setShowWalletDropdown(false);
  };

  const formatNotifTime = (t: number) => {
    const diff = Date.now() - t;
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    return `${days}d ago`;
  };

  if (showSplash) return <SplashScreen onComplete={() => setShowSplash(false)} />;
  if (showGattiWallet) return <div className="page-enter"><GattiWalletPage onBack={() => setShowGattiWallet(false)} /></div>;

  if (currentPage === "send") return <div key="send" className="page-enter"><SendPage onBack={() => goTo("home")} activeAddress={activeAddress} gattiPrivateKey={activeWallet === "gatti" ? gattiPrivateKey : null} /></div>;
  if (currentPage === "receive") return <div key="receive" className="page-enter"><ReceivePage onBack={() => goTo("home")} overrideAddress={activeAddress} isGattiWallet={activeWallet === "gatti"} /></div>;
  if (currentPage === "scan") return <div key="scan" className="page-enter"><ScanPage onBack={() => goTo("home")} onScan={() => goTo("send")} /></div>;
  if (currentPage === "swap") return <div key="swap" className="page-enter"><SwapPage onBack={() => goTo("home")} activeAddress={activeAddress} isGattiWallet={activeWallet === "gatti"} /></div>;

  const isLocked = lockUntil !== null && lockUntil > Date.now();

  const passwordModal = showPasswordModal && (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "var(--surface2)", border: "1px solid var(--border-light)", borderRadius: 24, padding: 24, width: "100%", maxWidth: 340, maxHeight: "85vh", overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {resetMode ? <ShieldAlert size={16} color="var(--accent)" /> : <Lock size={16} color="var(--accent)" />}
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, color: "var(--text)" }}>{resetMode ? "Reset Password" : "Unlock Wallet"}</span>
          </div>
          <button onClick={() => { setShowPasswordModal(false); setResetMode(false); }} style={{ background: "var(--surface3)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", display: "flex" }}>
            <X size={16} color="var(--text-muted)" />
          </button>
        </div>

        {!resetMode ? (
          <>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.6 }}>Enter your GattiPay Wallet password to unlock.</div>
            {isLocked ? (
              <div style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "var(--red)", fontWeight: 700 }}>{passwordError || "Wallet locked due to failed attempts."}</div>
              </div>
            ) : (
              <>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && confirmUnlock()}
                  placeholder="Password"
                  autoFocus
                  style={{ width: "100%", background: "var(--surface3)", border: `1px solid ${passwordError ? "var(--red)" : "var(--border-light)"}`, borderRadius: 12, padding: "12px 14px", fontSize: 14, color: "var(--text)", outline: "none", marginBottom: passwordError ? 6 : 16 }}
                />
                {passwordError && <div style={{ fontSize: 11, color: "var(--red)", marginBottom: 16, fontWeight: 600 }}>{passwordError}</div>}
                <button onClick={confirmUnlock} style={{ width: "100%", background: "var(--accent)", border: "none", borderRadius: 14, padding: "14px", fontSize: 14, fontWeight: 800, color: "#0a0e14", cursor: "pointer", marginBottom: 10 }}>
                  Unlock
                </button>
              </>
            )}
            <button onClick={() => { setResetMode(true); setResetError(""); }} style={{ width: "100%", background: "none", border: "none", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", cursor: "pointer", textAlign: "center" }}>
              Forgot Password?
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14, lineHeight: 1.6 }}>Enter your 12-word recovery phrase to reset your password.</div>
            <textarea
              value={resetSeed}
              onChange={(e) => setResetSeed(e.target.value)}
              placeholder="word1 word2 word3 ..."
              rows={3}
              style={{ width: "100%", background: "var(--surface3)", border: "1px solid var(--border-light)", borderRadius: 12, padding: "12px 14px", fontSize: 12, color: "var(--text)", outline: "none", fontFamily: "monospace", resize: "none", marginBottom: 12 }}
            />
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password (min 6 chars)" style={{ width: "100%", background: "var(--surface3)", border: "1px solid var(--border-light)", borderRadius: 12, padding: "12px 14px", fontSize: 13, color: "var(--text)", outline: "none", marginBottom: 10 }} />
            <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="Confirm new password" style={{ width: "100%", background: "var(--surface3)", border: "1px solid var(--border-light)", borderRadius: 12, padding: "12px 14px", fontSize: 13, color: "var(--text)", outline: "none", marginBottom: (resetError && resetError !== "__SUCCESS__") ? 6 : 14 }} />
            {resetError && resetError !== "__SUCCESS__" && <div style={{ fontSize: 11, color: "var(--red)", marginBottom: 14, fontWeight: 600 }}>{resetError}</div>}
            {resetError === "__SUCCESS__" && (
              <div style={{ background: "var(--accent-dim)", border: "1px solid var(--accent)", borderRadius: 12, padding: "12px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <Check size={16} color="var(--accent)" />
                <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 700 }}>Password reset! Unlock with your new password.</span>
              </div>
            )}
            <button onClick={confirmReset} style={{ width: "100%", background: "var(--accent)", border: "none", borderRadius: 14, padding: "14px", fontSize: 14, fontWeight: 800, color: "#0a0e14", cursor: "pointer", marginBottom: 10 }}>
              Reset Password
            </button>
            <button onClick={() => setResetMode(false)} style={{ width: "100%", background: "none", border: "none", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", cursor: "pointer", textAlign: "center" }}>
              ← Back to Unlock
            </button>
          </>
        )}
      </div>
    </div>
  );

  const metaMaskCardBig = isConnected && (
    <button key="mm-big" onClick={switchToExternal} style={{ width: "100%", background: activeWallet === "external" ? "var(--accent-dim)" : "var(--surface)", border: activeWallet === "external" ? "1px solid var(--accent)" : "1px solid var(--border)", borderRadius: 16, padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="" style={{ width: 32, height: 32 }} />
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>MetaMask</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""}</div>
        </div>
      </div>
      {activeWallet === "external" ? <Check size={18} color="var(--accent)" /> : <div style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 700 }}>TAP</div>}
    </button>
  );

  const gattiCardBig = gattiWalletData && (
    <button key="gp-big" onClick={unlockGattiWallet} style={{ width: "100%", background: activeWallet === "gatti" ? "var(--accent-dim)" : "var(--surface)", border: activeWallet === "gatti" ? "1px solid var(--accent)" : "1px solid var(--border)", borderRadius: 16, padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 15, fontWeight: 900, color: "var(--accent)" }}>G</span>
        </div>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>GattiPay Wallet</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>{gattiWalletData.address.slice(0, 6)}...{gattiWalletData.address.slice(-4)}</div>
        </div>
      </div>
      {activeWallet === "gatti" ? <Check size={18} color="var(--accent)" /> : <div style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 700 }}>TAP</div>}
    </button>
  );

  const walletCardsOrdered = activeWallet === "gatti" ? [gattiCardBig, metaMaskCardBig] : [metaMaskCardBig, gattiCardBig];

  const metaMaskCardSmall = isConnected && (
    <button key="mm-small" onClick={switchToExternal} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px", background: activeWallet === "external" ? "var(--accent-dim)" : "var(--surface3)", borderRadius: 10, marginBottom: 6, border: "none", cursor: "pointer" }}>
      <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="" style={{ width: 22, height: 22 }} />
      <div style={{ flex: 1, textAlign: "left" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text)" }}>MetaMask</div>
        <div style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "monospace" }}>{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""}</div>
      </div>
      {activeWallet === "external" && <Check size={14} color="var(--accent)" />}
    </button>
  );

  const gattiCardSmall = gattiWalletData ? (
    <button key="gp-small" onClick={unlockGattiWallet} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px", background: activeWallet === "gatti" ? "var(--accent-dim)" : "var(--surface3)", borderRadius: 10, marginBottom: 6, border: "none", cursor: "pointer" }}>
      <div style={{ width: 22, height: 22, borderRadius: 7, background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 900, color: "var(--accent)" }}>G</span>
      </div>
      <div style={{ flex: 1, textAlign: "left" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text)" }}>GattiPay Wallet</div>
        <div style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "monospace" }}>{gattiWalletData.address.slice(0, 6)}...{gattiWalletData.address.slice(-4)}</div>
      </div>
      {activeWallet === "gatti" && <Check size={14} color="var(--accent)" />}
    </button>
  ) : (
    <button key="gp-create" onClick={() => { setShowWalletDropdown(false); setShowGattiWallet(true); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px", background: "var(--surface3)", borderRadius: 10, border: "1px dashed var(--border-light)", cursor: "pointer", marginBottom: 6 }}>
      <span style={{ fontSize: 15, fontWeight: 900, color: "var(--accent)" }}>G</span>
      <div style={{ flex: 1, textAlign: "left" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text)" }}>Create GattiPay Wallet</div>
      </div>
    </button>
  );

  const dropdownCardsOrdered = activeWallet === "gatti" ? [gattiCardSmall, metaMaskCardSmall] : [metaMaskCardSmall, gattiCardSmall];

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

  if (currentPage === "wallet") {
    return (
      <div key="wallet" className="page-enter" style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)" }}>
        {passwordModal}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px" }}>
          <button onClick={() => goTo("home")} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "8px", cursor: "pointer", display: "flex" }}>
            <ArrowLeft size={18} color="var(--text-secondary)" />
          </button>
          <span style={{ fontSize: 17, fontWeight: 800, color: "var(--text)" }}>Wallet</span>
        </div>
        
        <div style={{ flex: 1, padding: "0 16px", overflow: "auto" }}>
          {!isConnected && !gattiWalletData ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 20 }}>
              <div style={{ width: 80, height: 80, borderRadius: 24, background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Wallet size={36} color="var(--accent)" strokeWidth={1.5} />
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "var(--text)" }}>Connect Your Wallet</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", maxWidth: 260, lineHeight: 1.7 }}>Connect MetaMask, or create your own GattiPay Wallet to get started.</div>
              <button onClick={openModal} style={{ background: "var(--accent)", border: "none", borderRadius: 16, padding: "16px 48px", fontSize: 15, fontWeight: 800, color: "#0a0e14", cursor: "pointer", boxShadow: "0 0 30px var(--accent-glow)" }}>
                Connect Wallet
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 0.8, marginTop: 4 }}>YOUR WALLETS — TAP TO USE</div>
              {walletCardsOrdered}
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 0.8, marginTop: 8 }}>ADD WALLET</div>
              <button onClick={openConnectModal} style={{ width: "100%", background: "var(--surface)", border: "1px dashed var(--border-light)", borderRadius: 16, padding: "16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                <Wallet size={20} color="var(--accent)" />
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>Add Another External Wallet</span>
              </button>
              {!gattiWalletData && (
                <button onClick={() => setShowGattiWallet(true)} style={{ width: "100%", background: "var(--surface)", border: "1px dashed var(--border-light)", borderRadius: 16, padding: "16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                  <span style={{ fontSize: 18, fontWeight: 900, color: "var(--accent)" }}>G</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>Create GattiPay Wallet</span>
                </button>
              )}
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

  if (currentPage === "profile") {
    return (
      <div key="profile" className="page-enter" style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)" }}>
        <div style={{ flex: 1, overflow: "auto" }}>
          <ProfilePage onBack={() => goTo("home")} />
        </div>
        {bottomNav}
      </div>
    );
  }

  return (
    <div key="home" className="page-enter" style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)", overflow: "hidden", position: "relative", zIndex: 1 }}>
      {passwordModal}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px 0" }}>
        <button onClick={openModal} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--surface3)", border: "1.5px solid var(--border-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={16} color="var(--text-secondary)" />
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 3 }}>
              {activeAddress ? shortAddr : "Connect Wallet"}
              <ChevronDown size={12} color="var(--text-muted)" />
            </div>
            <div style={{ fontSize: 10, color: activeAddress ? "var(--accent)" : "var(--text-muted)", fontWeight: 600 }}>
              {activeAddress ? "● BNB Smart Chain" : "Tap to connect"}
            </div>
          </div>
        </button>

        <div className="notif-dropdown-container" style={{ position: "relative" }}>
          <button onClick={() => setShowNotifDropdown(!showNotifDropdown)} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "9px", cursor: "pointer", display: "flex", position: "relative" }}>
            <Bell size={17} color="var(--text-secondary)" />
            {notifications.length > 0 && <div style={{ position: "absolute", top: 6, right: 6, width: 6, height: 6, background: "var(--accent)", borderRadius: "50%" }} />}
          </button>

          {showNotifDropdown && (
            <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "var(--surface2)", border: "1px solid var(--border-light)", borderRadius: 16, padding: 10, width: 280, zIndex: 50, boxShadow: "0 12px 32px rgba(0,0,0,0.4)", maxHeight: 340, overflow: "auto" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, letterSpacing: 0.5, padding: "4px 8px 10px" }}>NOTIFICATIONS</div>
              {notifications.length === 0 ? (
                <div style={{ padding: "24px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>No notifications yet</div>
                </div>
              ) : (
                notifications.slice(0, 6).map((n) => (
                  <div key={n.id} style={{ display: "flex", gap: 10, padding: "10px 8px", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ width: 30, height: 30, borderRadius: 9, background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <ShieldCheck size={14} color="var(--accent)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{n.title}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.5 }}>{n.subtitle}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>{formatNotifTime(n.time)}</div>
                    </div>
                  </div>
                ))
              )}
              <button onClick={() => { setShowNotifDropdown(false); goTo("history"); }} style={{ width: "100%", background: "var(--surface3)", border: "none", borderRadius: 10, padding: "10px", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", cursor: "pointer", marginTop: 8 }}>
                View Transaction History →
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ margin: "14px 16px 0", background: "linear-gradient(145deg, var(--surface) 0%, var(--surface2) 100%)", border: "1px solid var(--border)", borderRadius: 24, padding: "20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 160, height: 160, background: "var(--accent-glow)", borderRadius: "50%", filter: "blur(70px)", pointerEvents: "none" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, position: "relative" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Total Balance</div>
          <div className="wallet-dropdown-container" style={{ position: "relative" }}>
            <button onClick={() => activeAddress ? setShowWalletDropdown(!showWalletDropdown) : openModal()} style={{ fontSize: 10, fontWeight: 700, padding: "5px 12px", borderRadius: 10, border: "none", cursor: "pointer", background: activeAddress ? "var(--accent-dim)" : "var(--accent)", color: activeAddress ? "var(--accent)" : "#0a0e14", boxShadow: activeAddress ? "none" : "0 0 20px var(--accent-glow)", transition: "all 0.3s", display: "flex", alignItems: "center", gap: 5 }}>
              {activeAddress ? (
                <>
                  {activeWallet === "gatti" ? (
                    <span style={{ fontSize: 12, fontWeight: 900 }}>G</span>
                  ) : (
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="" style={{ width: 13, height: 13 }} />
                  )}
                  {activeWallet === "gatti" ? "GattiPay" : "MetaMask"}
                  <ChevronDown size={11} />
                </>
              ) : "Connect Wallet"}
            </button>

            {showWalletDropdown && (
              <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "var(--surface2)", border: "1px solid var(--border-light)", borderRadius: 14, padding: 10, width: 220, zIndex: 50, boxShadow: "0 12px 32px rgba(0,0,0,0.4)" }}>
                <div style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 700, letterSpacing: 0.5, padding: "4px 8px", marginBottom: 4 }}>SWITCH WALLET</div>
                {dropdownCardsOrdered}
                <button onClick={() => { setShowWalletDropdown(false); openConnectModal(); }} style={{ width: "100%", background: "none", border: "1px dashed var(--border-light)", borderRadius: 10, padding: "8px", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", cursor: "pointer" }}>
                  + Add Another Wallet
                </button>
              </div>
            )}
          </div>
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
