import React, { createContext, useContext, useState } from "react";
import { ITokenDetailRes, TokenDetailSC } from "@/interfaces/token";
import { API_PATH } from "@/constant/api-path";
import { getAPI } from "@/service";
import {
  QueryObserverResult,
  RefetchOptions,
  useQuery,
} from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { get } from "lodash";
import { pumpContractABI } from "@/abi/pumpContractAbi";
import { envs } from "@/constant/envs";
import { useReadContract } from "wagmi";
import { TOKEN_DECIMAL, NATIVE_TOKEN_DECIMAL } from "@/constant";
import BigNumber from "bignumber.js";
import { useAppSelector } from "@/libs/hooks";
import { ReadContractErrorType } from "viem";
import { AxiosResponse } from "axios";

interface TokenDetailContextType {
  tokenDetail: ITokenDetailRes;
  tokenDetailSC: TokenDetailSC | null;
  isTokenDetailLoading: boolean;
  isTokenDetailScLoading: boolean;
  refetch: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<unknown, ReadContractErrorType>>;
  refetchDetail: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<AxiosResponse<any, any>, Error>>;
}

const TokenDetailContext = createContext<TokenDetailContextType | undefined>(
  undefined
);

const mapToTokenDetail = ([
  symbol,
  tokenVirtualReserve,
  usdtVirtualReserve,
  isListed,
  tokensSold,
  usdtRaised,
  id,
  devWallet,
]: any[]): TokenDetailSC => ({
  symbol,
  tokenVirtualReserve: BigNumber(tokenVirtualReserve)
    .div(TOKEN_DECIMAL)
    .toString(),
  usdtVirtualReserve: BigNumber(usdtVirtualReserve)
    .div(NATIVE_TOKEN_DECIMAL)
    .toString(),
  isListed,
  tokensSold: BigNumber(tokensSold).div(TOKEN_DECIMAL).toString(),
  usdtRaised: BigNumber(usdtRaised).div(NATIVE_TOKEN_DECIMAL).toString(),
  id: id.toString(),
  devWallet,
});

export const TokenDetailProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const params = useParams();
  const { id } = params;
  const { accessToken: isAuthenticated } = useAppSelector(
    (state) => state.user
  );

  const {
    data,
    isFetching: isTokenDetailLoading,
    refetch: refetchDetail,
  } = useQuery({
    queryFn: () => {
      return getAPI(API_PATH.TOKEN.TOKEN_DETAIL, {
        params: {
          tokenId: id || null,
        },
      });
    },
    select(data) {
      return data;
    },
    queryKey: [API_PATH.TOKEN.TOKEN_DETAIL, isAuthenticated],
  });

  const tokenDetail = get(data, "data.data") as ITokenDetailRes;

  const {
    data: dataSC,
    refetch,
    isLoading: isTokenDetailScLoading,
  } = useReadContract({
    abi: pumpContractABI,
    address: envs.TOKEN_FACTORY_ADDRESS as any,
    functionName: "tokens",
    args: [tokenDetail?.contractAddress],
  });

  const tokenDetailSC = dataSC ? mapToTokenDetail(dataSC as []) : null;

  return (
    <TokenDetailContext.Provider
      value={{
        tokenDetail,
        tokenDetailSC,
        isTokenDetailLoading,
        isTokenDetailScLoading,
        refetch,
        refetchDetail,
      }}
    >
      {children}
    </TokenDetailContext.Provider>
  );
};

export const useTokenDetail = () => {
  const context = useContext(TokenDetailContext);
  if (!context) {
    throw new Error("useTokenDetail must be used within a TokenDetailProvider");
  }
  return context;
};
