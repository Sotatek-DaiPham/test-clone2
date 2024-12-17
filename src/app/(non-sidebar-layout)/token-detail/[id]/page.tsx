"use client";
import AppButton from "@/components/app-button";
import AppRoundedInfo from "@/components/app-rounded-info";
import { API_PATH } from "@/constant/api-path";
import { useTokenDetail } from "@/context/TokenDetailContext";
import { BeSuccessResponse } from "@/entities/response";
import { getTimeDDMMMYYYYHHMM } from "@/helpers/date-time";
import useSocket from "@/hooks/useSocket";
import useWalletAuth from "@/hooks/useWalletAuth";
import useWindowSize from "@/hooks/useWindowSize";
import { ISocketData } from "@/interfaces/token";
import { ESocketEvent } from "@/libs/socket/constants";
import { postAPI } from "@/service";
import { BackIcon } from "@public/assets";
import { useMutation } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import GeneralInfo from "../_components/GeneralInfo";
import PriceSection from "../_components/PriceSection";
import TabsSection from "../_components/TabsSection";
import TokenInfoSection from "../_components/TokenInfoSection";
import TradeSection from "../_components/TradeSection";
import TradingView from "../_components/TradingView";
import { PATH_ROUTER } from "@/constant/router";

const TokenDetailPage = () => {
  const { isDesktop } = useWindowSize();
  const { userAddress, accessToken } = useWalletAuth();
  const { addEvent, isConnected, removeEvent } = useSocket();
  const router = useRouter();
  const { tokenDetail, refetchDetail } = useTokenDetail();
  const { mutateAsync: viewToken } = useMutation({
    mutationFn: (
      tokenId: number
    ): Promise<AxiosResponse<BeSuccessResponse<any>>> => {
      return postAPI(API_PATH.USER.VIEW_TOKEN, {
        tokenId,
      });
    },
    onError: (err) => {},
    mutationKey: ["view-token"],
  });

  useEffect(() => {
    if (tokenDetail?.id && accessToken) {
      viewToken(tokenDetail?.id);
    }
  }, [tokenDetail?.id, accessToken]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const delayedRefetch = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        refetchDetail();
      }, 1000);
    };

    if (isConnected) {
      addEvent(ESocketEvent.BUY, (data: ISocketData) => {
        if (data.data.tokenAddress === tokenDetail?.contractAddress) {
          console.log("buy token event");
          delayedRefetch();
        }
      });
      addEvent(ESocketEvent.SELL, (data: ISocketData) => {
        if (data.data.tokenAddress === tokenDetail?.contractAddress) {
          console.log("sell token event");
          delayedRefetch();
        }
      });
      addEvent(ESocketEvent.CREATE_TOKEN, (data: ISocketData) => {
        console.log("create token event");
        delayedRefetch();
      });
    }
    return () => {
      removeEvent(ESocketEvent.BUY);
      removeEvent(ESocketEvent.SELL);
      removeEvent(ESocketEvent.CREATE_TOKEN);
      clearTimeout(timeoutId);
    };
  }, [isConnected, tokenDetail?.contractAddress]);

  const handleNavigateBack = () => {
    if (typeof window !== "undefined" && window.history.length > 2) {
      router.back();
    } else {
      router.push(PATH_ROUTER.DASHBOARD);
    }
  };

  return (
    <div className="m-auto p-2 max-w-[var(--width-content-sidebar-layout)]">
      <div
        className="flex gap-[9px] items-center mb-[26px] cursor-pointer w-fit"
        onClick={handleNavigateBack}
      >
        <Image src={BackIcon} alt="back icon" />
        <span className="text-white-neutral text-18px-bold">Token Detail</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-[65%] order-1 lg:order-1 gap-4">
          {/* Trading view section */}
          <div>
            <GeneralInfo />
            <TradingView />
          </div>

          {tokenDetail?.timeToListDex ? (
            <div className="flex gap-2 md:gap-6 mt-6 items-center flex-wrap">
              <div className="text-neutral-9 text-16px-normal">
                This token is successfully listed on Uniswap at{" "}
                {getTimeDDMMMYYYYHHMM(Number(tokenDetail?.timeToListDex))}
              </div>
              <AppButton size="small" customClass="!w-fit">
                View On Uniswap
              </AppButton>
            </div>
          ) : null}

          {/* Tab list section */}
          {isDesktop ? <TabsSection /> : null}
        </div>

        <div className="w-full lg:w-[35%] order-2 lg:order-2 gap-4">
          {/* Buy/Sell section */}
          <div className="mb-4">
            <TradeSection />
          </div>

          {/* Detail information section */}
          <PriceSection />
          {tokenDetail?.kingOfTheHillDate && (
            <AppRoundedInfo
              customClassName="mt-4"
              text={`Crowned king of the Sky at ${getTimeDDMMMYYYYHHMM(
                tokenDetail.kingOfTheHillDate
              )}`}
            />
          )}

          <TokenInfoSection tokenDetail={tokenDetail} />
          {!isDesktop ? <TabsSection /> : null}
        </div>
      </div>
    </div>
  );
};

export default TokenDetailPage;
