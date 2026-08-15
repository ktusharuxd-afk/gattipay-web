"use client";
import { useState } from "react";
import { Wallet, ArrowRight, Shield, Zap } from "lucide-react";

interface SplashProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashProps) {
  const [step, setStep] = useState(0);

  const slides = [
    {
      Icon: Wallet,
      title: "Welcome to GattiPay",
      subtitle: "Decentralized crypto payments — fast, secure, non-custodial.",
    },
    {
      Icon: Zap,
      title: "Instant Transfers",
      subtitle: "Send and receive BNB & wHON in seconds. No banks, no delays.",
    },
    {
      Icon: Shield,
      title: "Your Keys, Always",
      subtitle: "We never hold your funds. Your wallet, your crypto, your control.",
    },
  ];

  const current = slides[step];
  const isLast = step === slides.length - 1;

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100vh",
      background: "var(--bg)", justifyContent: "center", alignItems: "center",
      padding: "0 32px", position: "relative", overflow: "hidden"
    }}>
      {/* Glow */}
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 200, height: 200, background: "var(--accent-glow)", borderRadius: "50%", filter: "blur(100px)", pointerEvents: "none" }} />

      {/* Icon */}
      <div key={step} style={{
        width: 80, height: 80, borderRadius: 24,
        background: "var(--accent-dim)", border: "1px solid var(--border-light)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 32,
        animation: "pageIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
      }}>
        <current.Icon size={36} color="var(--accent)" strokeWidth={1.8} />
      </div>

      {/* Text */}
      <div key={`t-${step}`} style={{ textAlign: "center", animation: "pageIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}>
        <div style={{ fontSize: 26, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.5px", marginBottom: 12 }}>
          {current.title}
        </div>
        <div style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 300, margin: "0 auto" }}>
          {current.subtitle}
        </div>
      </div>

      {/* Dots */}
      <div style={{ display: "flex", gap: 8, marginTop: 48 }}>
        {slides.map((_, i) => (
          <div key={i} style={{
            width: i === step ? 24 : 8, height: 8,
            borderRadius: 4,
            background: i === step ? "var(--accent)" : "var(--surface3)",
            transition: "all 0.3s ease"
          }} />
        ))}
      </div>

      {/* Button */}
      <button
        onClick={() => {
          if (isLast) {
            localStorage.setItem("gattipay_onboarded", "true");
            onComplete();
          } else {
            setStep(step + 1);
          }
        }}
        style={{
          marginTop: 48, width: "100%", maxWidth: 320,
          background: isLast ? "var(--accent)" : "var(--surface)",
          border: isLast ? "none" : "1px solid var(--border)",
          borderRadius: 16, padding: "16px",
          fontSize: 15, fontWeight: 800,
          color: isLast ? "#0a0e14" : "var(--text)",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          transition: "all 0.2s"
        }}
      >
        {isLast ? "Get Started" : "Next"}
        <ArrowRight size={18} />
      </button>

      {/* Skip */}
      {!isLast && (
        <button
          onClick={() => { localStorage.setItem("gattipay_onboarded", "true"); onComplete(); }}
          style={{ marginTop: 16, background: "none", border: "none", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", fontWeight: 600 }}
        >
          Skip
        </button>
      )}
    </div>
  );
}