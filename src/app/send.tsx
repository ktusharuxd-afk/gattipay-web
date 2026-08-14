"use client";
import { useState } from "react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { BrowserProvider, parseEther, isAddress } from "ethers";
import type { Eip1193Provider } from "ethers";

interface SendPageProps {
  onBack: () => void;
}

export default function SendPage({ onBack }: SendPageProps) {
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Eip1193Provider>("eip155");

  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [txHash, setTxHash] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const isValidAddress = isAddress(toAddress);
  const isValidAmount = parseFloat(amount) > 0;

  const handleSend = async () => {
    if (!isConnected || !walletProvider) return;
    if (!isValidAddress || !isValidAmount) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const tx = await signer.sendTransaction({
        to: toAddress,
        value: parseEther(amount),
      });
      setTxHash(tx.hash);
      setStatus("success");
      const txRecord = {
        hash: tx.hash,
        from: address,
        to: toAddress,
        value: amount,
        time: Date.now(),
      };
      const existing = JSON.parse(localStorage.getItem("gattipay_txns") || "[]");
      existing.unshift(txRecord);
      localStorage.setItem("gattipay_txns", JSON.stringify(existing.slice(0, 10)));
    } catch (e: unknown) {
      setStatus("error");
      if (e instanceof Error) {
        setErrorMsg(e.message.slice(0, 100));
      }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "24px 20px 0" }}>
        <button onClick={onBack} style={{ background: "none", border: "1.5px solid var(--border)", borderRadius: 12, padding: "6px 14px", color: "var(--text-muted)", fontSize: 16, cursor: "pointer" }}>←</button>
        <span style={{ fontSize: 20, fontWeight: 800, color: "var(--text)" }}>Send</span>
      </div>

      {/* From */}
      <div style={{ margin: "24px 16px 0", background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 16, padding: "16px 20px" }}>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>From</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{address ? `${address.slice(0, 10)}...${address.slice(-6)}` : "—"}</div>
      </div>

      {/* To Address */}
      <div style={{ margin: "12px 16px 0" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>To address</div>
        <input
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
          placeholder="0x..."
          style={{ width: "100%", background: "var(--surface)", border: `1.5px solid ${toAddress && !isValidAddress ? "var(--red)" : "var(--border)"}`, borderRadius: 14, padding: "14px 16px", fontSize: 14, color: "var(--text)", outline: "none" }}
        />
        {toAddress && !isValidAddress && (
          <div style={{ fontSize: 12, color: "var(--red)", marginTop: 4 }}>Invalid address</div>
        )}
      </div>

      {/* Amount */}
      <div style={{ margin: "12px 16px 0" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>Amount (BNB)</div>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          type="number"
          style={{ width: "100%", background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 14, padding: "14px 16px", fontSize: 20, fontWeight: 700, color: "var(--text)", outline: "none" }}
        />
      </div>

      {/* Send Button */}
      <div style={{ margin: "24px 16px 0" }}>
        <button
          onClick={handleSend}
          disabled={!isValidAddress || !isValidAmount || status === "loading"}
          style={{ width: "100%", background: isValidAddress && isValidAmount ? "var(--accent)" : "var(--border)", border: "none", borderRadius: 16, padding: "16px", fontSize: 16, fontWeight: 700, color: isValidAddress && isValidAmount ? "#0d1117" : "var(--text-muted)", cursor: isValidAddress && isValidAmount ? "pointer" : "not-allowed" }}
        >
          {status === "loading" ? "Sending..." : "Send"}
        </button>
      </div>

      {/* Success */}
      {status === "success" && (
        <div style={{ margin: "16px 16px 0", background: "#d1fae5", border: "1.5px solid var(--green)", borderRadius: 16, padding: "16px 20px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#065f46", marginBottom: 4 }}>✅ Transaction sent!</div>
          <div style={{ fontSize: 11, color: "#065f46", wordBreak: "break-all" }}>Tx: {txHash}</div>
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div style={{ margin: "16px 16px 0", background: "#fee2e2", border: "1.5px solid var(--red)", borderRadius: 16, padding: "16px 20px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#991b1b", marginBottom: 4 }}>❌ Transaction failed</div>
          <div style={{ fontSize: 12, color: "#991b1b" }}>{errorMsg}</div>
        </div>
      )}

    </div>
  );
}