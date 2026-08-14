"use client";

import { wagmiAdapter, projectId } from "./config";
import { createAppKit } from "@reown/appkit/react";
import { bsc, bscTestnet } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { ReactNode, useEffect } from "react";

const queryClient = new QueryClient();

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [bsc, bscTestnet],
  defaultNetwork: bsc,
  metadata: {
    name: "GattiPay",
    description: "Decentralized crypto payments — simple as GPay",
    url: "https://gattipay-web.vercel.app",
    icons: ["https://gattipay-web.vercel.app/favicon.ico"],
  },
  features: {
    analytics: false,
    email: false,
    socials: false,
  },
  themeVariables: {
    "--w3m-accent": "#06d6a0",
    "--w3m-border-radius-master": "12px",
  },
});

function ModalFix() {
  useEffect(() => {
    const interval = setInterval(() => {
      const modal = document.querySelector("w3m-modal") as HTMLElement;
      if (modal) {
        const isOpen = modal.hasAttribute("open");
        modal.style.pointerEvents = isOpen ? "all" : "none";
        modal.style.display = isOpen ? "block" : "none";
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);
  return null;
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ModalFix />
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}