import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { bsc, bscTestnet } from "@reown/appkit/networks";
import { cookieStorage, createStorage } from "@wagmi/core";

export const projectId = "ea6e343d06ca259052fb93ad8c20f188";

export const networks = [bsc, bscTestnet];

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;