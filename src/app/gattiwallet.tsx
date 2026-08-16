"use client";
import { useState, useEffect } from "react";
import { Wallet as EthersWallet } from "ethers";
import { ArrowLeft, Copy, Check, Eye, EyeOff, ShieldCheck, KeyRound } from "lucide-react";

interface GattiWalletProps {
  onBack: () => void;
}

type Step = "start" | "create-seed" | "verify-seed" | "set-password" | "unlocked" | "import";

export default function GattiWalletPage({ onBack }: GattiWalletProps) {
  const [step, setStep] = useState<Step>("start");
  const [mnemonic, setMnemonic] = useState("");
  const [showSeed, setShowSeed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verifyWords, setVerifyWords] = useState<{ index: number; word: string }[]>([]);
  const [userInputs, setUserInputs] = useState<{ [key: number]: string }>({});
  const [error, setError] = useState("");
  const [importPhrase, setImportPhrase] = useState("");
  const [existingWallet, setExistingWallet] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("gattipay_own_wallet");
    if (saved) {
      setExistingWallet(JSON.parse(saved));
    }
  }, []);

  const createNewWallet = () => {
    try {
      const wallet = EthersWallet.createRandom();
      const phrase = wallet.mnemonic?.phrase || "";
      setMnemonic(phrase);
      setStep("create-seed");
    } catch (e) {
      console.error("Wallet creation failed:", e);
    }
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
    const wallet = EthersWallet.fromPhrase(mnemonic);
    const walletData = {
      address: wallet.address,
      encryptedMnemonic: btoa(mnemonic),
      passwordHash: btoa(password),
      passwordHistory: [btoa(password)],
      createdAt: Date.now(),
    };
    localStorage.setItem("gattipay_own_wallet", JSON.stringify(walletData));
    setExistingWallet(walletData);
    setError("");
    setStep("unlocked");
  };

  const importExistingWallet = () => {
    try {
      const wallet = EthersWallet.fromPhrase(importPhrase.trim());
      setMnemonic(importPhrase.trim());
      setError("");
      setStep("set-password");
    } catch {
      setError("Invalid recovery phrase. Please check and try again.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px" }}>
        <button onClick={onBack} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "8px", cursor: "pointer", display: "flex" }}>
          <ArrowLeft size={18} color="var(--text-secondary)" />
        </button>
        <span style={{ fontSize: 17, fontWeight: 800, color: "var(--text)" }}>GattiPay Wallet</span>
      </div>

      <div style={{ flex: 1, padding: "0 16px", overflow: "auto" }}>

        {/* START */}
        {step === "start" && !existingWallet && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "70vh", gap: 20 }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: "var(--accent)" }}>G</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "var(--text)", textAlign: "center" }}>Create Your GattiPay Wallet</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", maxWidth: 280, lineHeight: 1.7 }}>
              A self-custody wallet built into GattiPay. You control your keys — no one else, not even us.
            </div>
            <button onClick={createNewWallet} style={{ width: "100%", background: "var(--accent)", border: "none", borderRadius: 16, padding: "16px", fontSize: 15, fontWeight: 800, color: "#0a0e14", cursor: "pointer", boxShadow: "0 0 24px var(--accent-glow)" }}>
              Create New Wallet
            </button>
            <button onClick={() => setStep("import")} style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "16px", fontSize: 14, fontWeight: 700, color: "var(--text-secondary)", cursor: "pointer" }}>
              Import Existing Wallet
            </button>
          </div>
        )}

        {/* IMPORT */}
        {step === "import" && (
          <div style={{ paddingTop: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: "var(--text)", marginBottom: 8 }}>Import Wallet</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.6 }}>Enter your 12-word recovery phrase, separated by spaces.</div>
            <textarea
              value={importPhrase}
              onChange={(e) => setImportPhrase(e.target.value)}
              placeholder="word1 word2 word3 ..."
              rows={4}
              style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "14px 16px", fontSize: 13, color: "var(--text)", outline: "none", fontFamily: "monospace", resize: "none" }}
            />
            {error && <div style={{ fontSize: 12, color: "var(--red)", marginTop: 8, fontWeight: 600 }}>{error}</div>}
            <button onClick={importExistingWallet} style={{ width: "100%", marginTop: 20, background: "var(--accent)", border: "none", borderRadius: 16, padding: "16px", fontSize: 15, fontWeight: 800, color: "#0a0e14", cursor: "pointer" }}>
              Continue
            </button>
          </div>
        )}

        {/* CREATE SEED - SHOW PHRASE */}
        {step === "create-seed" && (
          <div style={{ paddingTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <ShieldCheck size={18} color="var(--yellow)" />
              <span style={{ fontSize: 15, fontWeight: 800, color: "var(--text)" }}>Backup Your Wallet</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.7 }}>
              Write down these 12 words in order and store them safely. This is the <strong style={{ color: "var(--text)" }}>only way</strong> to recover your wallet.
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
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.6 }}>Enter the following words from your recovery phrase to confirm you saved it.</div>

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
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.6 }}>This password unlocks your wallet on this device.</div>

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

        {/* UNLOCKED / EXISTING WALLET */}
        {(step === "unlocked" || (step === "start" && existingWallet)) && existingWallet && (
          <div style={{ paddingTop: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--accent-dim)", border: "2px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Check size={28} color="var(--accent)" />
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "var(--text)" }}>Wallet Ready!</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace", background: "var(--surface)", padding: "8px 14px", borderRadius: 10 }}>
                {existingWallet.address.slice(0, 10)}...{existingWallet.address.slice(-8)}
              </div>
            </div>
            <button onClick={onBack} style={{ width: "100%", background: "var(--accent)", border: "none", borderRadius: 16, padding: "16px", fontSize: 15, fontWeight: 800, color: "#0a0e14", cursor: "pointer" }}>
              Go to Wallet
            </button>
          </div>
        )}

      </div>
    </div>
  );
}