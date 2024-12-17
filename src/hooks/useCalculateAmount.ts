import { pumpContractABI } from "@/abi/pumpContractAbi";
import { envs } from "@/constant/envs";
import { ECoinType } from "@/interfaces/token";
import BigNumber from "bignumber.js";
import { useEffect, useMemo } from "react";
import { useReadContract } from "wagmi";

const useCalculateAmount = ({
  contractAddress,
  value,
  decimalIn,
  decimalOut,
  functionName,
  coinType,
}: {
  contractAddress: string | null;
  value: string;
  decimalIn: number;
  decimalOut: number;
  functionName:
    | "calculateBuyAmountIn"
    | "calculateBuyAmountOut"
    | "calculateSellAmountIn"
    | "calculateSellAmountOut";
  coinType: ECoinType;
}) => {
  const { data, ...rest } = useReadContract({
    abi: pumpContractABI,
    address: envs.TOKEN_FACTORY_ADDRESS as any,
    functionName: functionName,
    args: [contractAddress, BigNumber(value).multipliedBy(decimalIn).toFixed()],
    query: {
      enabled: false,
    },
  });
  const amount = useMemo(() => {
    switch (functionName) {
      case "calculateBuyAmountIn":
      case "calculateSellAmountIn":
        return data;
      case "calculateBuyAmountOut":
      case "calculateSellAmountOut":
        return (data as any)?.[0];
    }
  }, [data, value, contractAddress]);

  useEffect(() => {
    if (!!contractAddress && !!value) {
      rest.refetch();
    }
  }, [contractAddress, value, coinType]);

  return {
    amount: BigNumber(amount as string)
      .div(decimalOut)
      .toString(),
    ...rest,
  };
};

export default useCalculateAmount;
