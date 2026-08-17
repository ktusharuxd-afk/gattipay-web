"use client";
import { useState, useEffect } from "react";
import { Wallet as EthersWallet } from "ethers";
import { ArrowLeft, Copy, Check, Eye, ShieldCheck, KeyRound, Plus, Wallet as WalletIcon, ChevronRight } from "lucide-react";

interface GattiWalletProps {
  onBack: () => void;
}

interface StoredWallet {
  id: string;
  label: string;
  address: string;
  encryptedMnemonic: string;
  passwordHash: string;
  passwordHistory: string[];
  createdAt: number;
}

type Step = "list" | "start" | "create-seed" | "verify-seed" | "set-password" | "unlocked" | "import";

export default function GattiWalletPage({ onBack }: GattiWalletProps) {
  const [step, setStep] = useState<Step>("list");
  const [wallets, setWallets] = useState<StoredWallet[]>([]);
  const [walletLabel, setWalletLabel] = useState("");
  const [mnemonic, setMnemonic] = useState("");
  const [showSeed, setShowSeed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verifyWords, setVerifyWords] = useState<{ index: number; word: string }[]>([]);
  const [userInputs, setUserInputs] = useState<{ [key: number]: string }>({});
  const [error, setError] = useState("");
  const [importPhrase, setImportPhrase] = useState("");
  const [newWalletAddress, setNewWalletAddress] = useState("");

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = () => {
    const saved = localStorage.getItem("gattipay_wallets");
    if (saved) {
      setWallets(JSON.parse(saved));
    } else {
      const old = localStorage.getItem("gattipay_own_wallet");
      if (old) {
        const oldData = JSON.parse(old);
        const migrated: StoredWallet = {
          id: "wallet_1",
          label: "Personal",
          address: oldData.address,
          encryptedMnemonic: oldData.encryptedMnemonic,
          passwordHash: oldData.passwordHash,
          passwordHistory: oldData.passwordHistory || [oldData.passwordHash],
          createdAt: oldData.createdAt || Date.now(),
        };
        localStorage.setItem("gattipay_wallets", JSON.stringify([migrated]));
        setWallets([migrated]);
      }
    }
  };

  const createNewWallet = () => {
    if (!walletLabel.trim()) {
      setError("Please enter a wallet name");
      return;
    }
    const wallet = EthersWallet.createRandom();
    setMnemonic(wallet.mnemonic?.phrase || "");
    setNewWalletAddress(wallet.address);
    setError("");
    setStep("create-seed");
  };

  const copySeed = () => {
    navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const proceedToVerify = () => {
    const words = mnemonic.split(" ");
    const randomIndices = new Set<number>();
    while (randomIndices.size < 3) {
      randomIndices.add(Math.floor(Math.random() * words.length));
    }
    const verify = Array.from(randomIndices).sort((a, b) => a - b).map(index => ({ index, word: words[index] }));
    setVerifyWords(verify);
    setUserInputs({});
    setStep("verify-seed");
  };

  const checkVerification = () => {
    const allCorrect = verifyWords.every(v => userInputs[v.index]?.trim().toLowerCase() === v.word.toLowerCase());
    if (allCorrect) {
      setError("");
      setStep("set-password");
    } else {
      setError("Words don't match. Please check your backup and try again.");
    }
  };

  const savePasswordAndCreate = () => {
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    const newWallet: StoredWallet = {
      id: "wallet_" + Date.now(),
      label: walletLabel,
      address: newWalletAddress,
      encryptedMnemonic: btoa(mnemonic),
      passwordHash: btoa(password),
      passwordHistory: [btoa(password)],
      createdAt: Date.now(),
    };
    const updated = [...wallets, newWallet];
    localStorage.setItem("gattipay_wallets", JSON.stringify(updated));
    setWallets(updated);
    setError("");
    setPassword("");
    setConfirmPassword("");
    setWalletLabel("");
    setMnemonic("");
    setStep("unlocked");
  };

  const importExistingWallet = () => {
    try {
      const wallet = EthersWallet.fromPhrase(importPhrase.trim());
      setMnemonic(importPhrase.trim());
      setNewWalletAddress(wallet.address);
      setError("");
      setStep("set-password");
    } catch {
      setError("Invalid recovery phrase. Please check and try again.");
    }
  };

  const deleteWallet = (id: string) => {
    if (confirm("Delete this wallet? Make sure you have your recovery phrase backed up!")) {
      const updated = wallets.filter(w => w.id !== id);
      localStorage.setItem("gattipay_wallets", JSON.stringify(updated));
      setWallets(updated);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)" }}>

      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px" }}>
        <button onClick={step === "list" ? onBack : () => setStep("list")} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "8px", cursor: "pointer", display: "flex" }}>
          <ArrowLeft size={18} color="var(--text-secondary)" />
        </button>
        <span style={{ fontSize: 17, fontWeight: 800, color: "var(--text)" }}>GattiPay Wallets</span>
      </div>

      <div style={{ flex: 1, padding: "0 16px", overflow: "auto" }}>

        {/* WALLET LIST */}
        {step === "list" && (
          <div style={{ paddingTop: 10 }}>
            {wallets.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 20 }}>
                <div style={{ width: 80, height: 80, borderRadius: 24, background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 32, fontWeight: 900, color: "var(--accent)" }}>G</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "var(--text)", textAlign: "center" }}>No wallets yet</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", maxWidth: 260 }}>Create your first self-custody wallet. You control your keys — no one else.</div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 0.8, marginBottom: 12 }}>YOUR WALLETS</div>
                {wallets.map((w) => (
                  <div key={w.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <WalletIcon size={18} color="var(--accent)" />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{w.label}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>{w.address.slice(0, 8)}...{w.address.slice(-6)}</div>
                      </div>
                    </div>
                    <button onClick={() => deleteWallet(w.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 11, cursor: "pointer" }}>Remove</button>
                  </div>
                ))}
              </>
            )}

            <button onClick={() => setStep("start")} style={{ width: "100%", background: "var(--accent)", border: "none", borderRadius: 16, padding: "16px", fontSize: 15, fontWeight: 800, color: "#0a0e14", cursor: "pointer", marginTop: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 0 24px var(--accent-glow)" }}>
              <Plus size={18} /> Add New Wallet
            </button>
          </div>
        )}

        {/* START - LABEL INPUT */}
        {step === "start" && (
          <div style={{ paddingTop: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: "var(--text)", marginBottom: 8 }}>Name Your Wallet</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.6 }}>Give this wallet a name — like "Personal" or "Business Treasury" — to keep things organized.</div>
            <input
              value={walletLabel}
              onChange={(e) => setWalletLabel(e.target.value)}
              placeholder="e.g. Personal, Treasury"
              style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "14px 16px", fontSize: 14, color: "var(--text)", outline: "none", marginBottom: 12 }}
            />
            {error && <div style={{ fontSize: 12, color: "var(--red)", marginBottom: 12, fontWeight: 600 }}>{error}</div>}
            <button onClick={createNewWallet} style={{ width: "100%", background: "var(--accent)", border: "none", borderRadius: 16, padding: "16px", fontSize: 15, fontWeight: 800, color: "#0a0e14", cursor: "pointer", marginBottom: 10 }}>
              Create New Wallet
            </button>
            <button onClick={() => { setStep("import"); setError(""); }} style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "16px", fontSize: 14, fontWeight: 700, color: "var(--text-secondary)", cursor: "pointer" }}>
              Import Existing Wallet
            </button>
          </div>
        )}

        {/* IMPORT */}
        {step === "import" && (
          <div style={{ paddingTop: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: "var(--text)", marginBottom: 8 }}>Import Wallet</div>
            <input
              value={walletLabel}
              onChange={(e) => setWalletLabel(e.target.value)}
              placeholder="Wallet name (e.g. Treasury)"
              style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "14px 16px", fontSize: 14, color: "var(--text)", outline: "none", marginBottom: 12 }}
            />
            <textarea
              value={importPhrase}
              onChange={(e) => setImportPhrase(e.target.value)}
              placeholder="word1 word2 word3 ..."
              rows={4}
              style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "14px 16px", fontSize: 13, color: "var(--text)", outline: "none", fontFamily: "monospace", resize: "none" }}
            />
            {error && <div style={{ fontSize: 12, color: "var(--red)", marginTop: 8, fontWeight: 600 }}>{error}</div>}
            <button onClick={() => { if (!walletLabel.trim()) { setError("Enter a wallet name first"); return; } importExistingWallet(); }} style={{ width: "100%", marginTop: 20, background: "var(--accent)", border: "none", borderRadius: 16, padding: "16px", fontSize: 15, fontWeight: 800, color: "#0a0e14", cursor: "pointer" }}>
              Continue
            </button>
          </div>
        )}

        {/* CREATE SEED */}
        {step === "create-seed" && (
          <div style={{ paddingTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <ShieldCheck size={18} color="var(--yellow)" />
              <span style={{ fontSize: 15, fontWeight: 800, color: "var(--text)" }}>Backup "{walletLabel}"</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.7 }}>
              Write down these 12 words in order. This is the <strong style={{ color: "var(--text)" }}>only way</strong> to recover this wallet.
            </div>

            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 16, position: "relative" }}>
              <div style={{ filter: showSeed ? "none" : "blur(8px)", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {mnemonic.split(" ").map((word, i) => (
                  <div key={i} style={{ background: "var(--surface3)", borderRadius: 10, padding: "8px 10px", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{i + 1}.</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{word}</span>
                  </div>
                ))}
              </div>
              {!showSeed && (
                <button onClick={() => setShowSeed(true)} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "var(--accent)", border: "none", borderRadius: 12, padding: "10px 20px", fontSize: 12, fontWeight: 800, color: "#0a0e14", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  <Eye size={14} /> Tap to Reveal
                </button>
              )}
            </div>

            {showSeed && (
              <button onClick={copySeed} style={{ marginTop: 12, background: "var(--surface3)", border: "1px solid var(--border-light)", borderRadius: 10, padding: "8px 16px", fontSize: 12, fontWeight: 700, color: copied ? "var(--accent)" : "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy to clipboard</>}
              </button>
            )}

            <div style={{ marginTop: 16, background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 14, padding: "12px 16px" }}>
              <div style={{ fontSize: 12, color: "var(--red)", fontWeight: 700, lineHeight: 1.6 }}>
                Never share this phrase. Anyone with these words can access your funds.
              </div>
            </div>

            <button onClick={proceedToVerify} disabled={!showSeed} style={{ width: "100%", marginTop: 20, background: showSeed ? "var(--accent)" : "var(--surface3)", border: "none", borderRadius: 16, padding: "16px", fontSize: 15, fontWeight: 800, color: showSeed ? "#0a0e14" : "var(--text-muted)", cursor: showSeed ? "pointer" : "not-allowed" }}>
              I've Saved It — Continue
            </button>
          </div>
        )}

        {/* VERIFY SEED */}
        {step === "verify-seed" && (
          <div style={{ paddingTop: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: "var(--text)", marginBottom: 8 }}>Verify Backup</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.6 }}>Enter the following words to confirm you saved it.</div>

            {verifyWords.map((v) => (
              <div key={v.index} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6 }}>Word #{v.index + 1}</div>
                <input
                  value={userInputs[v.index] || ""}
                  onChange={(e) => setUserInputs({ ...userInputs, [v.index]: e.target.value })}
                  style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 14px", fontSize: 14, color: "var(--text)", outline: "none" }}
                />
              </div>
            ))}

            {error && <div style={{ fontSize: 12, color: "var(--red)", marginBottom: 12, fontWeight: 600 }}>{error}</div>}

            <button onClick={checkVerification} style={{ width: "100%", background: "var(--accent)", border: "none", borderRadius: 16, padding: "16px", fontSize: 15, fontWeight: 800, color: "#0a0e14", cursor: "pointer" }}>
              Verify
            </button>
          </div>
        )}

        {/* SET PASSWORD */}
        {step === "set-password" && (
          <div style={{ paddingTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <KeyRound size={18} color="var(--accent)" />
              <span style={{ fontSize: 18, fontWeight: 900, color: "var(--text)" }}>Set a Password</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.6 }}>This password unlocks "{walletLabel}" on this device.</div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6 }}>Password</div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 14px", fontSize: 14, color: "var(--text)", outline: "none" }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6 }}>Confirm Password</div>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 14px", fontSize: 14, color: "var(--text)", outline: "none" }} />
            </div>

            {error && <div style={{ fontSize: 12, color: "var(--red)", marginBottom: 12, fontWeight: 600 }}>{error}</div>}

            <button onClick={savePasswordAndCreate} style={{ width: "100%", background: "var(--accent)", border: "none", borderRadius: 16, padding: "16px", fontSize: 15, fontWeight: 800, color: "#0a0e14", cursor: "pointer" }}>
              Create Wallet
            </button>
          </div>
        )}

        {/* SUCCESS */}
        {step === "unlocked" && (
          <div style={{ paddingTop: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--accent-dim)", border: "2px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Check size={28} color="var(--accent)" />
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "var(--text)" }}>Wallet Ready!</div>
            </div>
            <button onClick={() => setStep("list")} style={{ width: "100%", background: "var(--accent)", border: "none", borderRadius: 16, padding: "16px", fontSize: 15, fontWeight: 800, color: "#0a0e14", cursor: "pointer" }}>
              View All Wallets
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
