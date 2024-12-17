"use client";
import NoData from "@/components/no-data";
import { API_PATH } from "@/constant/api-path";
import { useTokenDetail } from "@/context/TokenDetailContext";
import useSocket from "@/hooks/useSocket";
import { ISocketData } from "@/interfaces/token";
import { ESocketEvent } from "@/libs/socket/constants";
import {
  Candle,
  configurationData,
  DEFAULT_TRADING_VIEW_INTERVAL,
  ID_TRADING_VIEW,
} from "@/libs/trading-view/constants";
import {
  addTradeToLastCandle,
  createEmptyCandleIfNeeded,
  getClientTimezone,
  getInterval,
} from "@/libs/trading-view/helpers";
import { getAPI } from "@/service";

import {
  IChartingLibraryWidget,
  LibrarySymbolInfo,
  ResolutionString,
  ResolveCallback,
  SubscribeBarsCallback,
} from "@public/charting_library/charting_library.min";
import { HistoryCallback } from "@public/charting_library/datafeed-api";
import BigNumber from "bignumber.js";
import dayjs from "dayjs";
import { get, isEmpty } from "lodash";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

const AppTradingView = dynamic(() => import("@/components/app-trading-view"), {
  ssr: false,
});

interface IDataChart {
  resolution: string;
  tokenAddress: string;
  endTime?: number;
}

BigNumber.config({
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
});

async function getData({ resolution, tokenAddress, endTime }: IDataChart) {
  if (!tokenAddress) return [];
  const intervalInSeconds = getInterval(resolution) * 60 * 1000;
  const data = await getAPI(API_PATH.TRADING.TRADING_VIEW, {
    params: {
      tokenAddress,
      resolution: intervalInSeconds,
      endDateMilis: endTime,
    },
  });

  const dataTradingView = get(data, "data.data", []);

  const bars: any = dataTradingView.map((bar: any) => ({
    time: bar.startTimeFrame,
    close: parseFloat(
      new BigNumber(bar.close).div(new BigNumber(10).pow(18))?.toString()
    ),
    open: parseFloat(
      new BigNumber(bar.open).div(new BigNumber(10).pow(18))?.toString()
    ),
    high: parseFloat(
      new BigNumber(bar.high).div(new BigNumber(10).pow(18))?.toString()
    ),
    low: parseFloat(
      new BigNumber(bar.low).div(new BigNumber(10).pow(18))?.toString()
    ),
    volume: parseFloat(
      new BigNumber(bar.volume).div(new BigNumber(10).pow(18))?.toString()
    ),
  }));
  return bars;
}

const TradingView = () => {
  const chartRef = useRef<IChartingLibraryWidget>();
  const lastCandleRef = useRef<Candle>({} as Candle);
  const timeRef = useRef<number>(0);
  const chartResetCacheNeededCallback = useRef<() => void>();
  const { isConnected, socket } = useSocket();
  const { tokenDetail } = useTokenDetail();

  const intervalInMillisecondsRef = useRef<number>(
    getInterval(DEFAULT_TRADING_VIEW_INTERVAL) * 60 * 1000
  );
  const [intervalState, setIntervalState] = useState(
    getInterval(DEFAULT_TRADING_VIEW_INTERVAL)
  );

  const chartRealtimeCallback = useRef<any>();

  intervalInMillisecondsRef.current = intervalState * 60 * 1000;

  // Handle trade event
  const handleTradeEvent = useCallback(
    (data: any, resolution: ResolutionString) => {
      const intervalInMilliseconds = getInterval(resolution) * 60 * 1000;
      lastCandleRef.current = addTradeToLastCandle(
        data,
        lastCandleRef.current,
        intervalInMilliseconds,
        chartRealtimeCallback?.current
      );
    },
    [tokenDetail, chartRealtimeCallback?.current]
  );

  const getBars = useCallback(
    async (
      symbolInfo: any,
      resolution: any,
      from: number,
      to: number,
      onResult: HistoryCallback,
      onError: any,
      isFirstCall: boolean
    ) => {
      if (
        tokenDetail?.createdAt &&
        !isFirstCall &&
        from < dayjs(tokenDetail?.createdAt).unix()
      ) {
        return onResult([], { noData: true });
      }
      if (tokenDetail?.contractAddress) {
        try {
          const endTime = to * 1000;
          const time = isFirstCall ? endTime : timeRef.current;
          const bars = await getData({
            resolution,
            tokenAddress: tokenDetail?.contractAddress,
            endTime: time,
          });
          if (!isEmpty(bars)) {
            if (!bars[0]?.time) {
              onResult([], { noData: true });
              return;
            }
            setIntervalState(resolution);
            timeRef.current = bars[0]?.time;
            lastCandleRef.current = bars[bars.length - 1];
            onResult(bars, { noData: false });
          } else {
            onResult([], {
              noData: true,
            });
          }
        } catch (error) {
          onResult([], { noData: true });
        }
      } else {
        onResult([], { noData: true });
      }
    },
    [tokenDetail, timeRef.current]
  );

  const resolveSymbol = useCallback(
    (symbolName: string, onSymbolResolvedCallback: ResolveCallback) => {
      const symbolInfo: LibrarySymbolInfo = {
        exchange: "",
        full_name: "",
        listed_exchange: "",
        ticker: symbolName,
        name: symbolName,
        description: symbolName,
        type: "bitcoin",
        session: "24x7",
        timezone: getClientTimezone(),
        minmov: 1,
        pricescale: 1000000000000000,
        has_intraday: true,
        has_weekly_and_monthly: true,
        intraday_multipliers: configurationData.intraday_multipliers,
        supported_resolutions: configurationData.supported_resolutions,
        volume_precision: 5,
      };
      onSymbolResolvedCallback(symbolInfo);
    },
    [tokenDetail]
  );

  const subscribeBars = useCallback(
    async (
      symbolInfo: LibrarySymbolInfo,
      resolution: ResolutionString,
      onRealtimeCallback: SubscribeBarsCallback,
      listenerGuid: string,
      onResetCacheNeededCallback: () => void
    ) => {
      chartRealtimeCallback.current = onRealtimeCallback;
      chartResetCacheNeededCallback.current = onResetCacheNeededCallback;

      if (isConnected) {
        socket?.on(ESocketEvent.BUY, (res: ISocketData) => {
          if (res.data.tokenAddress === tokenDetail?.contractAddress) {
            handleTradeEvent(res.data, resolution);
          }
        });
        socket?.on(ESocketEvent.SELL, (res: ISocketData) => {
          if (res.data.tokenAddress === tokenDetail?.contractAddress) {
            handleTradeEvent(res.data, resolution);
          }
        });
        socket?.on(ESocketEvent.CREATE_TOKEN, (res: ISocketData) => {
          if (res.data.tokenAddress === tokenDetail?.contractAddress) {
            handleTradeEvent(res.data, resolution);
          }
        });
      }
    },
    [tokenDetail, isConnected]
  );

  const CreteEmptyCandle = () => {
    const lastCandle = lastCandleRef.current;
    const intervalInMilliseconds = intervalInMillisecondsRef.current;
    lastCandleRef.current = createEmptyCandleIfNeeded(
      lastCandle,
      intervalInMilliseconds,
      chartRealtimeCallback.current
    );
  };

  useEffect(() => {
    let interval: any;
    interval = setInterval(CreteEmptyCandle, 5000);
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      {!tokenDetail?.contractAddress ? (
        <div className="w-full h-[var(--height-trading-view)] flex items-center justify-center">
          <div>
            <NoData />
          </div>
        </div>
      ) : (
        <AppTradingView
          onLoad={(chart: any) => {
            chartRef.current = chart;
          }}
          resolveSymbol={resolveSymbol}
          subscribeBars={subscribeBars}
          getBars={getBars}
          containerId={ID_TRADING_VIEW}
          isConnected={isConnected}
          symbol={tokenDetail?.symbol}
          tokenAddress={tokenDetail?.contractAddress}
        />
      )}
    </div>
  );
};

export default TradingView;
