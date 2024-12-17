"use client";
import {
  configurationData,
  DEFAULT_TRADING_VIEW_INTERVAL,
  disabledFeatures,
} from "@/libs/trading-view/constants";
import { useEffect, useRef, useState } from "react";

import withClient from "@/helpers/with-client";
import { getClientTimezone } from "@/libs/trading-view/helpers";
import {
  ChartingLibraryWidgetOptions,
  IBasicDataFeed,
  IChartingLibraryWidget,
  ResolutionString,
  SubscribeBarsCallback,
  TradingTerminalWidgetOptions,
  widget,
} from "@public/charting_library/charting_library.min";

import {
  ErrorCallback,
  HistoryCallback,
  LibrarySymbolInfo,
  ResolveCallback,
} from "@public/charting_library/datafeed-api";
import { Spin } from "antd";

interface ChartContainerProps {
  libraryPath?: ChartingLibraryWidgetOptions["library_path"];
  chartsStorageUrl?: ChartingLibraryWidgetOptions["charts_storage_url"];
  chartsStorageApiVersion?: ChartingLibraryWidgetOptions["charts_storage_api_version"];
  clientId?: ChartingLibraryWidgetOptions["client_id"];
  userId?: ChartingLibraryWidgetOptions["user_id"];
  containerId: ChartingLibraryWidgetOptions["container_id"];
  autosize?: ChartingLibraryWidgetOptions["autosize"];
  studiesOverrides?: ChartingLibraryWidgetOptions["studies_overrides"];
  visible?: boolean;
  onLoad?: (chartView: IChartingLibraryWidget) => void;
  getBars: (
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    rangeStartDate: number,
    rangeEndDate: number,
    onResult: HistoryCallback,
    onError: ErrorCallback,
    isFirstCall: boolean
  ) => void;
  subscribeBars: (
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onRealtimeCallback: SubscribeBarsCallback,
    listenerGuid: string,
    onResetCacheNeededCallback: () => void
  ) => void;
  resolveSymbol: (
    symbolName: string,
    onSymbolResolvedCallback: ResolveCallback
  ) => void;
  // other props
  isConnected: boolean;
  symbol: string;
  tokenAddress: string;
}

const AppTradingView = (props: ChartContainerProps) => {
  const {
    isConnected,
    getBars,
    subscribeBars,
    resolveSymbol,
    onLoad,
    symbol,
    tokenAddress,
  } = props;
  const tradingChartRef = useRef<HTMLDivElement>(null);
  const [widgetCom, setWidgetCom] = useState<IChartingLibraryWidget | null>();
  const [isChartReady, setChartReady] = useState(false);
  const chartResetCacheNeededCallback = useRef<() => void>();

  const onReady = (callback: any) => {
    setTimeout(() => callback(configurationData));
  };

  const datafeed: IBasicDataFeed = {
    onReady,
    searchSymbols: () => {},
    resolveSymbol,
    getBars,
    subscribeBars,
    unsubscribeBars: () => {},
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!tokenAddress) {
        return;
      }
      const widgetOptions: TradingTerminalWidgetOptions = {
        symbol: symbol,
        datafeed: datafeed,
        interval: DEFAULT_TRADING_VIEW_INTERVAL,
        container_id: props.containerId || "",
        library_path: "/en/rain-pump/charting_library/",
        locale: "en",
        disabled_features: disabledFeatures,
        enabled_features: [
          "dont_show_boolean_study_arguments",
          "hide_last_na_study_output",
          "study_templates",
        ],
        toolbar_bg: "#171717",
        overrides: {
          "paneProperties.background": "#171717",
          volumePaneSize: "medium",
          "priceScale.priceFormat precision": 15,
        },
        studies_overrides: {
          "volume.show ma": true,
        },
        custom_css_url: "/tradingview-chart.css",
        timezone: getClientTimezone(),
        charts_storage_url: "https://saveload.tradingview.com",
        charts_storage_api_version: "1.1",
        client_id: "tradingview.com",
        user_id: "public_user_id",
        fullscreen: true,
        autosize: true,
        theme: "Dark",
        widgetbar: {
          details: false,
        },
      };

      const tvWidget = new widget(widgetOptions);
      setWidgetCom(tvWidget);
      tvWidget.onChartReady(() => {
        setChartReady(true);
        onLoad?.(tvWidget);
        tvWidget.applyOverrides({
          "paneProperties.backgroundGradientStartColor": "#020024",
        });
      });
    }
  }, [isConnected, tokenAddress]);

  useEffect(() => {
    if (isChartReady) {
      const onResetCacheNeededCallback = chartResetCacheNeededCallback.current;
      if (onResetCacheNeededCallback) onResetCacheNeededCallback();
      widgetCom?.chart().resetData();
    }
  }, [isChartReady]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className={`flex items-center justify-center w-full flex-1 `}>
        <div className="h-full flex items-center justify-center flex-1">
          <div
            id="loading-spinner"
            className="h-full flex justify-center items-center"
            style={{ display: "none" }}
          >
            <Spin size="large" />
          </div>
          <div
            data-container
            ref={tradingChartRef}
            className={`w-full h-full [&>iframe]:!h-[var(--height-trading-view)]`}
            id={props.containerId}
          />
        </div>
      </div>
    </div>
  );
};

export default withClient(AppTradingView);
