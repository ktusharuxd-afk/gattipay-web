"use client";
import { useState, useEffect } from "react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { BrowserProvider, JsonRpcProvider, Wallet as EthersWallet, Contract, parseEther, formatUnits } from "ethers";
import type { Eip1193Provider } from "ethers";
import { ArrowLeft, ArrowDownUp, CheckCircle, XCircle, Settings } from "lucide-react";

interface SwapPageProps {
  onBack: () => void;
  activeAddress?: string;
  gattiPrivateKey?: string | null;
}

const ROUTER_ADDRESS = "0x10ED43C718714eb63d5aA57B78B54704E256024";
const WBNB_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const WHON_ADDRESS = "0x0A1Ac7aE511cEcE9493602815A11d1c53b253518";
const BSC_RPC = "https://bsc-dataseed.binance.org";

const ROUTER_ABI = [
  "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
];

export default function SwapPage({ onBack, activeAddress, gattiPrivateKey }: SwapPageProps) {
  const { address: externalAddress, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Eip1193Provider>("eip155");

  const fromAddress = activeAddress || externalAddress;
  const usingGatti = !!gattiPrivateKey;

  const [bnbAmount, setBnbAmount] = useState("");
  const [whonQuote, setWhonQuote] = useState("0.00");
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [slippage, setSlippage] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [txHash, setTxHash] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const getQuote = async () => {
      const amt = parseFloat(bnbAmount);
      if (!amt || amt <= 0) {
        setWhonQuote("0.00");
        return;
      }
      setLoadingQuote(true);
      try {
        const provider = new JsonRpcProvider(BSC_RPC);
        const router = new Contract(ROUTER_ADDRESS, ROUTER_ABI, provider);
        const path = [WBNB_ADDRESS, WHON_ADDRESS];
        const amounts = await router.getAmountsOut(parseEther(bnbAmount), path);
        setWhonQuote(parseFloat(formatUnits(amounts[1], 18)).toFixed(4));
      } catch {
        setWhonQuote("0.00");
      } finally {
        setLoadingQuote(false);
      }
    };
    const debounce = setTimeout(getQuote, 500);
    return () => clearTimeout(debounce);
  }, [bnbAmount]);

  const isValidAmount = parseFloat(bnbAmount) > 0;
  const canSwap = isValidAmount && parseFloat(whonQuote) > 0 && status !== "loading";

  const handleSwap = async () => {
    if (!canSwap) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const amountIn = parseEther(bnbAmount);
      const path = [WBNB_ADDRESS, WHON_ADDRESS];
      const minOut = (parseFloat(whonQuote) * (1 - slippage / 100));
      const amountOutMin = parseEther(minOut.toFixed(18));
      const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

      let tx;
      if (usingGatti && gattiPrivateKey) {
        const provider = new JsonRpcProvider(BSC_RPC);
        const wallet = new EthersWallet(gattiPrivateKey, provider);
        const router = new Contract(ROUTER_ADDRESS, ROUTER_ABI, wallet);
        tx = await router.swapExactETHForTokens(amountOutMin, path, fromAddress, deadline, { value: amountIn });
      } else {
        if (!isConnected || !walletProvider) throw new Error("Wallet not connected");
        const provider = new BrowserProvider(walletProvider);
        const signer = await provider.getSigner();
        const router = new Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);
        tx = await router.swapExactETHForTokens(amountOutMin, path, fromAddress, deadline, { value: amountIn });
      }
      setTxHash(tx.hash);
      setStatus("success");
    } catch (e: unknown) {
      setStatus("error");
      if (e instanceof Error) setErrorMsg(e.message.slice(0, 120));
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "8px", cursor: "pointer", display: "flex" }}>
            <ArrowLeft size={18} color="var(--text-secondary)" />
          </button>
          <span style={{ fontSize: 17, fontWeight: 800, color: "var(--text)" }}>Swap</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "6px 10px" }}>
          <Settings size={12} color="var(--text-muted)" />
          <select value={slippage} onChange={(e) => setSlippage(Number(e.target.value))} style={{ background: "none", border: "none", color: "var(--text)", fontSize: 11, fontWeight: 700, outline: "none" }}>
            <option value={0.5}>0.5%</option>
            <option value={1}>1%</option>
            <option value={3}>3%</option>
          </select>
        </div>
      </div>

      {/* From */}
      <div style={{ margin: "0 16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "16px" }}>
        <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>You Pay</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            value={bnbAmount}
            onChange={(e) => setBnbAmount(e.target.value)}
            placeholder="0.00"
            type="number"
            style={{ flex: 1, background: "none", border: "none", fontSize: 28, fontWeight: 900, color: "var(--text)", outline: "none", letterSpacing: "-1px", width: "100%" }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--surface3)", borderRadius: 12, padding: "8px 12px" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#F0B90B" }} />
            <span style={{ fontSize: 14, fontWeight: 800, color: "var(--text)" }}>BNB</span>
          </div>
        </div>
      </div>

      {/* Arrow */}
      <div style={{ display: "flex", justifyContent: "center", margin: "-8px 0" }}>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", border: "4px solid var(--bg)", zIndex: 2 }}>
          <ArrowDownUp size={16} color="#0a0e14" />
        </div>
      </div>

      {/* To */}
      <div style={{ margin: "0 16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "16px" }}>
        <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>You Receive (est.)</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, fontSize: 28, fontWeight: 900, color: "var(--text)", letterSpacing: "-1px" }}>
            {loadingQuote ? "..." : whonQuote}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--surface3)", borderRadius: 12, padding: "8px 12px" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--accent)" }} />
            <span style={{ fontSize: 14, fontWeight: 800, color: "var(--text)" }}>wHON</span>
          </div>
        </div>
      </div>

      <div style={{ margin: "14px 16px 0", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "12px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Slippage tolerance</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text)" }}>{slippage}%</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Route</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text)" }}>PancakeSwap V2</span>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ padding: "0 16px 20px" }}>
        <button onClick={handleSwap} disabled={!canSwap} style={{ width: "100%", background: canSwap ? "var(--accent)" : "var(--surface3)", border: "none", borderRadius: 16, padding: "16px", fontSize: 15, fontWeight: 800, color: canSwap ? "#0a0e14" : "var(--text-muted)", cursor: canSwap ? "pointer" : "not-allowed", boxShadow: canSwap ? "0 0 24px var(--accent-glow)" : "none" }}>
          {status === "loading" ? "Swapping..." : "Swap"}
        </button>
      </div>

      {status === "success" && (
        <div style={{ margin: "0 16px 16px", background: "var(--surface)", border: "1px solid var(--green)", borderRadius: 16, padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <CheckCircle size={16} color="var(--green)" />
            <span style={{ fontSize: 13, fontWeight: 800, color: "var(--green)" }}>Swap successful!</span>
          </div>
          <a href={"https://bscscan.com/tx/" + txHash} target="_blank" style={{ fontSize: 11, color: "var(--accent)", textDecoration: "none", fontWeight: 700 }}>View on BSCScan</a>
        </div>
      )}

      {status === "error" && (
        <div style={{ margin: "0 16px 16px", background: "var(--surface)", border: "1px solid var(--red)", borderRadius: 16, padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <XCircle size={16} color="var(--red)" />
            <span style={{ fontSize: 13, fontWeight: 800, color: "var(--red)" }}>Swap failed</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{errorMsg}</div>
        </div>
      )}
    </div>
  );
}
