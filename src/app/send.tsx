"use client";
import { useState } from "react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { BrowserProvider, JsonRpcProvider, Wallet as EthersWallet, Interface, parseEther, isAddress } from "ethers";
import type { Eip1193Provider } from "ethers";
import { ArrowLeft, ArrowUpRight, CheckCircle, XCircle, Copy } from "lucide-react";

interface SendPageProps {
  onBack: () => void;
  activeAddress?: string;
  gattiPrivateKey?: string | null;
}

const ROUTER_ADDRESS = "0x9022D0b88f41AE6B4A0f3d34c6b4f9BFA2a40a9A";
const ROUTER_ABI = ["function send(address to) external payable"];
const iface = new Interface(ROUTER_ABI);
const BSC_RPC = "https://bsc-dataseed1.binance.org";

export default function SendPage({ onBack, activeAddress, gattiPrivateKey }: SendPageProps) {
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Eip1193Provider>("eip155");

  const fromAddress = activeAddress || address;
  const usingGatti = !!gattiPrivateKey;

  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [txHash, setTxHash] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const isValidAddress = isAddress(toAddress);
  const isValidAmount = parseFloat(amount) > 0;
  const canSend = isValidAddress && isValidAmount && status !== "loading";

  const handleSend = async () => {
    if (!canSend || !fromAddress) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const value = parseEther(amount);
      const data = iface.encodeFunctionData("send", [toAddress]);

      let tx;
      if (usingGatti && gattiPrivateKey) {
        const provider = new JsonRpcProvider(BSC_RPC);
        const wallet = new EthersWallet(gattiPrivateKey, provider);
        tx = await wallet.sendTransaction({ to: ROUTER_ADDRESS, data, value });
      } else {
        if (!isConnected || !walletProvider) throw new Error("Wallet not connected");
        const provider = new BrowserProvider(walletProvider);
        const signer = await provider.getSigner();
        tx = await signer.sendTransaction({ to: ROUTER_ADDRESS, data, value });
      }
      setTxHash(tx.hash);
      setStatus("success");
      const txRecord = { hash: tx.hash, from: fromAddress, to: toAddress, value: amount, time: Date.now() };
      const existing = JSON.parse(localStorage.getItem("gattipay_txns") || "[]");
      existing.unshift(txRecord);
      localStorage.setItem("gattipay_txns", JSON.stringify(existing.slice(0, 10)));
    } catch (e: unknown) {
      setStatus("error");
      if (e instanceof Error) setErrorMsg(e.message.slice(0, 120));
    }
  };

  const pasteAddress = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.startsWith("0x")) setToAddress(text);
    } catch {}
  };

  const fee = isValidAmount ? (parseFloat(amount) * 0.0025).toFixed(6) : "0.000000";
  const willReceive = isValidAmount ? (parseFloat(amount) - parseFloat(fee)).toFixed(6) : "0.000000";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px" }}>
        <button onClick={onBack} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "8px", cursor: "pointer", display: "flex" }}>
          <ArrowLeft size={18} color="var(--text-secondary)" />
        </button>
        <span style={{ fontSize: 17, fontWeight: 800, color: "var(--text)" }}>Send</span>
      </div>

      <div style={{ margin: "0 16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "14px 16px" }}>
        <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>From {usingGatti ? "(GattiPay Wallet)" : "(MetaMask)"}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", fontFamily: "monospace" }}>
          {fromAddress ? fromAddress.slice(0, 14) + "..." + fromAddress.slice(-8) : "Not connected"}
        </div>
      </div>

      <div style={{ margin: "12px 16px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 1, textTransform: "uppercase" }}>To Address</div>
          <button onClick={pasteAddress} style={{ background: "var(--accent)", border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 800, color: "#0a0e14", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
            <Copy size={12} /> Paste
          </button>
        </div>
        <input value={toAddress} onChange={(e) => setToAddress(e.target.value)} placeholder="0x..." style={{ width: "100%", background: "var(--surface)", border: "1px solid " + (toAddress && !isValidAddress ? "var(--red)" : "var(--border)"), borderRadius: 14, padding: "14px 16px", fontSize: 13, color: "var(--text)", outline: "none", fontFamily: "monospace" }} />
        {toAddress && !isValidAddress && <div style={{ fontSize: 10, color: "var(--red)", marginTop: 4, fontWeight: 700 }}>Invalid address</div>}
      </div>

      <div style={{ margin: "12px 16px 0" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Amount (BNB)</div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F0B90B", flexShrink: 0 }} />
          <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" type="number" style={{ flex: 1, background: "none", border: "none", fontSize: 28, fontWeight: 900, color: "var(--text)", outline: "none", letterSpacing: "-1px", width: "100%" }} />
          <span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 700 }}>BNB</span>
        </div>
      </div>

      {isValidAmount && (
        <div style={{ margin: "12px 16px 0", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "12px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>GattiPay fee (0.25%)</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text)" }}>{fee} BNB</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Recipient gets</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)" }}>{willReceive} BNB</span>
          </div>
        </div>
      )}

      <div style={{ flex: 1 }} />

      <div style={{ padding: "0 16px 20px" }}>
        <button onClick={handleSend} disabled={!canSend} style={{ width: "100%", background: canSend ? "var(--accent)" : "var(--surface3)", border: "none", borderRadius: 16, padding: "16px", fontSize: 15, fontWeight: 800, color: canSend ? "#0a0e14" : "var(--text-muted)", cursor: canSend ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: canSend ? "0 0 24px var(--accent-glow)" : "none" }}>
          {status === "loading" ? "Confirming..." : <><ArrowUpRight size={18} /> Send BNB</>}
        </button>
      </div>

      {status === "success" && (
        <div style={{ margin: "0 16px 16px", background: "var(--surface)", border: "1px solid var(--green)", borderRadius: 16, padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <CheckCircle size={16} color="var(--green)" />
            <span style={{ fontSize: 13, fontWeight: 800, color: "var(--green)" }}>Transaction sent!</span>
          </div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", wordBreak: "break-all", fontFamily: "monospace", marginBottom: 8 }}>{txHash}</div>
          <a href={"https://bscscan.com/tx/" + txHash} target="_blank" style={{ fontSize: 11, color: "var(--accent)", textDecoration: "none", fontWeight: 700 }}>View on BSCScan</a>
        </div>
      )}

      {status === "error" && (
        <div style={{ margin: "0 16px 16px", background: "var(--surface)", border: "1px solid var(--red)", borderRadius: 16, padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <XCircle size={16} color="var(--red)" />
            <span style={{ fontSize: 13, fontWeight: 800, color: "var(--red)" }}>Failed</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{errorMsg}</div>
        </div>
      )}
    </div>
  );
}
