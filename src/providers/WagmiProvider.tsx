"use client";
import AccountModal from "@/components/app-modal/app-account-modal";
import { NATIVE_TOKEN_DECIMAL } from "@/constant";
import { envs } from "@/constant/envs";
import useTokenBalance from "@/hooks/useTokenBalance";
import { darkTheme, RainbowKitProvider, Theme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { merge } from "lodash";
import * as React from "react";
import { useAccount, useBalance, WagmiProvider } from "wagmi";
import { config } from "../wagmi";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const myCustomTheme: Theme = merge(darkTheme(), {
  colors: {
    accentColor: "#ff57c4",
    modalBackground: "#373738",
  },
  fonts: {
    body: "SF Pro",
  },
});

interface Props {
  children: React.ReactNode;
}

export interface AccountModalContextStates {
  isAccountModalOpen: boolean;
  setOpenAccountModal(open: boolean): void;
  // isBalanceLoading: boolean;
  // refetchUserBalance(): void;
  userBalance: string;
}

export const AccountModalContext =
  React.createContext<AccountModalContextStates>({
    isAccountModalOpen: false,
    setOpenAccountModal: () => {},
    // isBalanceLoading: false,
    // refetchUserBalance: () => {},
    userBalance: "0",
  });

export function useAccountModal(): AccountModalContextStates {
  return React.useContext(AccountModalContext);
}

const AccountModalProvider = ({ children }: Props) => {
  const [isOpen, setOpen] = React.useState(false);
  const { address } = useAccount();

  // const {
  //   balance,
  //   refetch: refetchUserBalance,
  //   isLoading,
  // } = useTokenBalance(address, envs.USDT_ADDRESS, NATIVE_TOKEN_DECIMAL);

  const { data: balance } = useBalance({
    address,
  });

  React.useEffect(() => {
    if (!address) {
      setOpen(false);
    }
  }, [address]);

  return (
    <AccountModalContext.Provider
      value={{
        isAccountModalOpen: isOpen,
        setOpenAccountModal: setOpen,
        // isBalanceLoading: isLoading,
        // refetchUserBalance,
        userBalance: balance?.value?.toString() || "0",
      }}
    >
      {children}
      <AccountModal onClose={() => setOpen(false)} open={isOpen} />
    </AccountModalContext.Provider>
  );
};

export function WagmiRainbowKitProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={myCustomTheme}>
          <AccountModalProvider>{children}</AccountModalProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
