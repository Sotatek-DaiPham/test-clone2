import { formatUnits } from "ethers";
import { useBalance } from "wagmi";

const useEthBalance = (address: string | null) => {
  const { data, refetch, ...rest } = useBalance({
    address: address as any,
    query: {
      enabled: !!address,
    },
  });

  return {
    formattedBalance: formatUnits(data?.value || "0", data?.decimals || 18),
    refetchEthBalance: refetch,
    balance: data?.value,
    ...rest,
  };
};

export default useEthBalance;
