import { API_PATH } from "@/constant/api-path";
import { useTokenDetail } from "@/context/TokenDetailContext";
import { BeSuccessResponse } from "@/entities/response";
import { ISaveTradeSettingsRes } from "@/interfaces/token";
import { useAppSelector } from "@/libs/hooks";
import { getAPI } from "@/service";
import { QueryObserverResult, useQuery } from "@tanstack/react-query";
import { Tabs, TabsProps } from "antd";
import { AxiosResponse } from "axios";
import { createContext, useContext } from "react";
import TradeTab from "./TradeTab";
import TradeTabAfterListed from "./TradeTabAfterListed";
import "./styles.scss";

export enum TabKey {
  BUY = "buy",
  SELL = "sell",
}

const TradeSettingsContext = createContext<{
  tradeSettings: ISaveTradeSettingsRes;
  refetchTradeSettings: () => Promise<
    QueryObserverResult<ISaveTradeSettingsRes, Error>
  >;
}>({
  tradeSettings: {
    slippage: "0",
    priorityFee: "0",
    fontRunning: false,
  },
  refetchTradeSettings: () =>
    Promise.resolve({} as QueryObserverResult<ISaveTradeSettingsRes, Error>),
});

export const useTradeSettings = () => {
  return useContext(TradeSettingsContext);
};

const TradeSection = () => {
  const { tokenDetail } = useTokenDetail();
  const { accessToken: isAuthenticated } = useAppSelector(
    (state) => state.user
  );

  const items: TabsProps["items"] = [
    {
      key: TabKey.BUY,
      label: "Buy",
      children: tokenDetail?.pairListDex ? (
        <TradeTabAfterListed tabKey={TabKey.BUY} />
      ) : (
        <TradeTab tabKey={TabKey.BUY} />
      ),
    },
    {
      key: TabKey.SELL,
      label: "Sell",
      children: tokenDetail?.pairListDex ? (
        <TradeTabAfterListed tabKey={TabKey.SELL} />
      ) : (
        <TradeTab tabKey={TabKey.SELL} />
      ),
    },
  ];

  const { data: tradeSettingsQuery, refetch: refetchTradeSettings } = useQuery({
    queryFn: (): Promise<
      AxiosResponse<BeSuccessResponse<ISaveTradeSettingsRes>>
    > => getAPI(API_PATH.USER.TRADE_SETTINGS),
    select: (res) => res?.data?.data,
    queryKey: ["trade-settings", isAuthenticated],
    enabled: !!isAuthenticated,
  });

  const tradeSettings = tradeSettingsQuery?.id
    ? tradeSettingsQuery
    : {
        slippage: "0",
        fontRunning: false,
        priorityFee: "0",
      };

  return (
    <TradeSettingsContext.Provider
      value={{ tradeSettings, refetchTradeSettings }}
    >
      <div className="trade-section">
        <Tabs defaultActiveKey="buy" items={items} />
      </div>
    </TradeSettingsContext.Provider>
  );
};

export default TradeSection;
