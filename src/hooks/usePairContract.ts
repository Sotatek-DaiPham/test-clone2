// src/hooks/usePairContract.ts

import { routerContractV2ABI } from "@/abi/routerContractV2";
import { uniswapPairAbi } from "@/abi/uniswapPairContract";
import { TOKEN_DECIMAL, NATIVE_TOKEN_DECIMAL } from "@/constant";
import { envs } from "@/constant/envs";
import BigNumber from "bignumber.js";
import { useReadContract } from "wagmi";

const usePairContract = (pairAddress: string | null) => {
  const { data: token0Address } = useReadContract({
    address: pairAddress as any,
    abi: uniswapPairAbi,
    functionName: "token0",
    query: {
      enabled: !!pairAddress,
    },
  });

  const { data: token1Address } = useReadContract({
    address: pairAddress as any,
    abi: uniswapPairAbi,
    functionName: "token1",
    query: {
      enabled: !!pairAddress,
    },
  });

  const { data: wethAddressData } = useReadContract({
    address: envs.CONTRACT_ROUTER_ADDRESS as any,
    abi: routerContractV2ABI,
    functionName: "WETH",
  });

  const { data: reserveData } = useReadContract({
    address: pairAddress as any,
    abi: uniswapPairAbi,
    functionName: "getReserves",
    query: {
      enabled: !!pairAddress,
    },
  });

  const [wethAddress, memeTokenAddress] =
    token0Address === wethAddressData
      ? [token0Address, token1Address]
      : [token1Address, token0Address];

  const [wethReserveIndex, memeTokenReserveIndex] =
    token0Address === wethAddress ? [0, 1] : [1, 0];

  return {
    memeTokenReserve: BigNumber(
      (reserveData as any[])?.[memeTokenReserveIndex] as number
    ).div(TOKEN_DECIMAL),
    wethReserve: BigNumber(
      (reserveData as any[])?.[wethReserveIndex] as number
    ).div(NATIVE_TOKEN_DECIMAL),
    memeTokenAddress,
    wethAddress,
  };
};

export default usePairContract;
