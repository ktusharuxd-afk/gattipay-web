"use client";

import { wagmiAdapter, projectId, networks } from "./config";
import { createAppKit } from "@reown/appkit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { ReactNode, useEffect } from "react";

const queryClient = new QueryClient();

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  defaultNetwork: networks[0],
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
    const fix = () => {
      const modal = document.querySelector("w3m-modal");
      if (modal) {
        const style = document.createElement("style");
        style.textContent = `
          w3m-modal:not([open]) {
            display: none !important;
            pointer-events: none !important;
          }
        `;
        document.head.appendChild(style);
      }
    };
    setTimeout(fix, 1000);
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