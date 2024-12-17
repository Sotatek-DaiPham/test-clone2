import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  imTokenWallet,
  ledgerWallet,
  metaMaskWallet,
  omniWallet,
  rainbowWallet,
  tahoWallet,
  trustWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;
const appName = "RainMakr";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Wallets",
      wallets: [
        metaMaskWallet,
        walletConnectWallet,
        trustWallet,
        coinbaseWallet,
        tahoWallet,
        rainbowWallet,
        imTokenWallet,
        ledgerWallet,
        omniWallet,
      ],
    },
  ],
  {
    projectId,
    appName,
  }
);

export const config = createConfig({
  connectors: [
    ...connectors,
    metaMask({
      dappMetadata: { name: appName },
    }),
  ],
  chains: [arbitrumSepolia],
  transports: {
    [arbitrumSepolia.id]: http(process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL),
  },
  // multiInjectedProviderDiscovery: false,
  ssr: true,
});
