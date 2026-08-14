"use client";

import { wagmiAdapter, projectId } from "./config";
import { createAppKit } from "@reown/appkit/react";
import { bsc, bscTestnet } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { ReactNode } from "react";

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
  allowUnsafeAttr: true,
});

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}