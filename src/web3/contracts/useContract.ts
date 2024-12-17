import useWalletAuth from "@/hooks/useWalletAuth";
import {
  Contract,
  Eip1193Provider,
  Interface,
  InterfaceAbi,
  Signer,
  ethers,
} from "ethers";
import { useMemo } from "react";
import { useAccount } from "wagmi";

const getContract = (
  abi: Interface | InterfaceAbi,
  address: string,
  signer?: Signer | ethers.ContractRunner
): Contract => {
  return new Contract(address, abi, signer);
};

export const useContract = (
  abi: Interface | InterfaceAbi,
  address: string,
  chainId?: number
): Promise<Contract | null> => {
  const { connector, isConnected, address: userAddress } = useAccount();
  const RPC = process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL;
  return useMemo(async () => {
    if (!ethers.isAddress(address)) {
      return null;
    }
    const provider = connector?.getProvider
      ? new ethers.BrowserProvider(
          (await connector?.getProvider?.()) as Eip1193Provider
        )
      : null;

    return getContract(
      abi,
      address,
      (await provider?.getSigner(userAddress)) ||
        new ethers.JsonRpcProvider(RPC)
    );
  }, [abi, address, connector, RPC, isConnected, userAddress]);
};

export const useReadContract = (
  abi: Interface | InterfaceAbi,
  address: string,
  chainId?: number
): Promise<Contract | null> => {
  const { connector } = useAccount();

  const RPC = process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL;

  console.log({ chainId, RPC });

  return useMemo(async () => {
    if (!ethers.isAddress(address)) {
      return null;
    }
    const provider = connector?.getProvider
      ? new ethers.BrowserProvider(
          (await connector?.getProvider?.()) as Eip1193Provider
        )
      : null;

    return getContract(
      abi,
      address,
      new ethers.JsonRpcProvider(RPC) || (await provider?.getSigner())
    );
  }, [abi, address, connector, RPC]);
};

export const useProvider = () => {
  const RPC = process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL;
  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  } else {
    return new ethers.JsonRpcProvider(RPC);
  }
};
