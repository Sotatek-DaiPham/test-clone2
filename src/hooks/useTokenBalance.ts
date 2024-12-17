import { erc20Abi } from "@/abi/usdtAbi";
import { TOKEN_DECIMAL } from "@/constant";
import BigNumber from "bignumber.js";
import { useReadContract } from "wagmi";

const useTokenBalance = (
  userAddress: any,
  contractAddress: any,
  tokenDecimal?: number
) => {
  const { data, ...rest } = useReadContract({
    abi: erc20Abi,
    address: contractAddress,
    functionName: "balanceOf",
    args: [userAddress],
    query: {
      enabled: !!userAddress && !!contractAddress,
    },
  });

  return {
    balance: data
      ? BigNumber(data as string)
          .div(tokenDecimal || TOKEN_DECIMAL)
          .toString()
      : "0",
    ...rest,
  };
};

export default useTokenBalance;
