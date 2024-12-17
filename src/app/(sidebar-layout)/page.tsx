"use client";
import AppButton from "@/components/app-button";
import AppTabs from "@/components/app-tabs";
import { EDirection } from "@/constant";
import { API_PATH } from "@/constant/api-path";
import {
  IKingOfTheSkyResponse,
  ITradeHistoryResponse,
} from "@/entities/dashboard";
import { BeSuccessResponse } from "@/entities/response";
import { useAppSearchParams } from "@/hooks/useAppSearchParams";
import useSocket from "@/hooks/useSocket";
import useWalletAuth from "@/hooks/useWalletAuth";
import useWindowSize from "@/hooks/useWindowSize";
import { ESocketEvent } from "@/libs/socket/constants";
import { getAPI } from "@/service";
import {
  BGEffect4Icon,
  RainPumpRabbitIcon,
  RainPumpText,
  RainPumpTextWhite,
} from "@public/assets";
import { useQuery } from "@tanstack/react-query";
import { Spin } from "antd";
import { AxiosResponse } from "axios";
import get from "lodash/get";
import Image from "next/image";
import { useEffect, useState } from "react";
import AllTab from "./_components/AllTab";
import FollowingTab from "./_components/FollowingTab";
import ModalHowItsWork from "./_components/ModalHowItsWork";
import ProjectCard from "./_components/ProjectCard";
import TradeHistoryItem from "./_components/TradeHistoryItem";

enum ETabsTerminal {
  ALL = "all",
  FOLLOWING = "following",
}

const HowItWorkMain = ({ onClick }: { onClick: (show: boolean) => void }) => {
  return (
    <div className="mb-3">
      <div className="h-full grid grid-cols-3 rounded-3xl !bg-neutral-2">
        <div className="col-span-1 relative">
          <Image
            src={RainPumpRabbitIcon}
            alt="how-it-work"
            className="absolute right-[-90px] bottom-0 scale-x-[-1]"
          />
        </div>
        <div className="col-span-1 h-full flex flex-col justify-between px-8 py-6 pb-10 relative !overflow-hidden">
          <div className="h-full w-full flex flex-col justify-center z-[2]">
            <div className="mx-auto">
              <div>
                <Image src={RainPumpTextWhite} alt="rain-pump-text" />
              </div>
              <div className="mx-auto my-4 !mb-10 text-white-neutral text-16px-normal text-center !font-['Montserrat']">
                The Most Liquid Fair Launch Platform
              </div>
            </div>
            <AppButton
              onClick={() => onClick(true)}
              customClass="!rounded-3xl !w-fit px-8 py-6 mx-auto"
              classChildren="!text-neutral-1 !text-16px-bold"
            >
              How It Works?
            </AppButton>
          </div>
          <Image
            className="absolute right-0 left-0 bottom-0 top-0 scale-110 z-[1]"
            src={BGEffect4Icon}
            alt="effect"
          />
        </div>
        <div className="col-span-1 relative">
          <Image
            src={RainPumpRabbitIcon}
            alt="how-it-work"
            className="absolute left-[-90px] bottom-0"
          />
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const { addEvent, isConnected, removeEvent } = useSocket();
  const { accessToken } = useWalletAuth();
  const { searchParams, setSearchParams } = useAppSearchParams("terminal");
  const {
    searchParams: howItWorks,
    setSearchParams: setSearchParamsHowItsWork,
  } = useAppSearchParams("howItWorks");

  const [activeTab, setActiveTab] = useState<string>(ETabsTerminal.ALL);
  const [isShowModal, setIsShowModal] = useState<boolean>(
    Boolean(howItWorks?.["how-it-works"]) || false
  );
  const { isMobile } = useWindowSize();

  const {
    data,
    isPending: isPendingKing,
    refetch,
  } = useQuery({
    queryKey: ["king-of-the-sky"],
    queryFn: async () => {
      return getAPI(API_PATH.TOKEN.KING_OF_THE_SKY) as Promise<
        AxiosResponse<BeSuccessResponse<IKingOfTheSkyResponse>, any>
      >;
    },
  });

  const kingOfTheSky = get(data, "data.data", {}) as IKingOfTheSkyResponse;

  const {
    data: dataTrade,
    isPending,
    refetch: refetchTrade,
  } = useQuery({
    queryKey: ["trade-history"],
    queryFn: async () => {
      return getAPI(API_PATH.TOKEN.TRADE_HISTORY_SLIDER, {
        params: {
          orderBy: "created_at",
          direction: EDirection.DESC,
          page: 1,
          limit: 14,
        },
      }) as Promise<
        AxiosResponse<BeSuccessResponse<ITradeHistoryResponse[]>, any>
      >;
    },
  });

  const tradeHistory = get(
    dataTrade,
    "data.data",
    []
  ) as ITradeHistoryResponse[];

  const tabs: any = [
    {
      label: "All",
      key: ETabsTerminal.ALL,
      children: <AllTab />,
    },
    accessToken
      ? {
          label: "Following",
          key: ETabsTerminal.FOLLOWING,
          children: <FollowingTab />,
        }
      : {},
  ];

  const handleChangeTab = (value: any) => {
    setActiveTab(value);
    setSearchParams({
      tab: value,
      filter: value === ETabsTerminal.ALL ? "trending" : "activity",
    });
  };

  useEffect(() => {
    if (searchParams.tab === ETabsTerminal.FOLLOWING) {
      setActiveTab(ETabsTerminal.FOLLOWING);
    }
    if (searchParams.tab === ETabsTerminal.ALL) {
      setActiveTab(ETabsTerminal.ALL);
    }
  }, []);

  useEffect(() => {
    if (isConnected) {
      addEvent(ESocketEvent.BUY, (data) => {
        if (data) {
          refetchTrade();
        }
      });
      addEvent(ESocketEvent.SELL, (data) => {
        if (data) {
          refetchTrade();
        }
      });
      addEvent(ESocketEvent.CHANGE_KING_OF_THE_HILL, (data) => {
        if (data) {
          refetch();
        }
      });
    }
    return () => {
      removeEvent(ESocketEvent.BUY);
      removeEvent(ESocketEvent.SELL);
      removeEvent(ESocketEvent.CHANGE_KING_OF_THE_HILL);
    };
  }, [isConnected]);

  const handleCloseModal = () => {
    setIsShowModal(false);
    setSearchParamsHowItsWork("");
  };

  return (
    <div className="h-full !m-[-24px]">
      <div
        className={`m-auto p-6 max-w-[var(--width-content-sidebar-layout)] ${
          !isMobile ? "pt-2" : ""
        }`}
      >
        <div
          className={`grid sm:grid-cols-2 grid-cols-1 gap-6 ${
            !Boolean(kingOfTheSky?.contractAddress) ? "!grid-cols-1" : ""
          }`}
        >
          {isPendingKing ? (
            <Spin />
          ) : !Boolean(kingOfTheSky?.contractAddress) &&
            !isMobile &&
            !isPendingKing ? (
            <HowItWorkMain onClick={setIsShowModal} />
          ) : (
            <div className="h-full grid grid-cols-3 rounded-3xl !bg-neutral-2">
              <div className="col-span-2 h-full flex flex-col justify-between px-8 py-6">
                <div className="h-full">
                  <div>
                    <Image src={RainPumpText} alt="rain-pump-text" />
                  </div>
                  <div className="truncate-4-line sm:my-3 my-4 text-white-neutral text-16px-normal !font-['Montserrat']">
                    The Most Liquid Fair
                    <br />
                    Launch Platform
                  </div>
                </div>
                <AppButton
                  onClick={() => setIsShowModal(true)}
                  customClass="!rounded-3xl !w-fit sm:mb-2 sm:!p-6 !px-3"
                  classChildren="!text-neutral-1 !text-14px-bold"
                >
                  How It Works?
                </AppButton>
              </div>
              <div className="col-span-1 relative">
                <Image
                  src={RainPumpRabbitIcon}
                  alt="how-it-work"
                  className="absolute sm:!w-[160%] sm:!max-w-[160%] !w-[190%] !max-w-[190%] sm:!right-[20px] right-0 bottom-0"
                />
              </div>
            </div>
          )}
          {Boolean(kingOfTheSky?.contractAddress) && (
            <div className="h-full">
              <div className="bg-neutral-2 rounded-3xl sm:p-6 px-2 pt-6 pb-2">
                <span className="text-primary-main italic text-32px-bold flex w-full justify-center !font-['Kanit']">
                  King of The Sky
                </span>
                <ProjectCard className="p-0" data={kingOfTheSky} />
              </div>
            </div>
          )}
        </div>
        {tradeHistory?.length && !isPending && (
          <div className="mt-7 mb-5 !h-[40px] border overflow-hidden border-neutral-4 flex bg-neutral-3 rounded-lg py-1">
            <div className="loop-slide">
              {tradeHistory?.map(
                (item: ITradeHistoryResponse, index: number) => (
                  <TradeHistoryItem key={index} item={item} />
                )
              )}
            </div>
          </div>
        )}
        <div className="my-5">
          <AppTabs
            items={tabs}
            activeKey={activeTab}
            onChange={handleChangeTab}
            destroyInactiveTabPane={true}
          />
        </div>
      </div>
      <ModalHowItsWork
        open={isShowModal}
        onOk={handleCloseModal}
        onCancel={handleCloseModal}
        destroyOnClose={true}
      />
    </div>
  );
}
