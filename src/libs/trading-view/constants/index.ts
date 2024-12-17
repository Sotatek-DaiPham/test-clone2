export const configurationData = {
  supports_search: true,
  supports_marks: true,
  intraday_multipliers: [
    "1",
    "3",
    "5",
    "15",
    "30",
    "60",
    "120",
    "240",
    "360",
    "480",
    "720",
  ],
  supported_resolutions: [
    "1",
    "3",
    "5",
    "15",
    "30",
    "60",
    "120",
    "240",
    "360",
    "480",
    "720",
    "1D",
    "3D",
    "1W",
    "1M",
  ],
};

export const ID_TRADING_VIEW = "tv_chart_container";

export const DEFAULT_TRADING_VIEW_INTERVAL = "15";

export const disabledFeatures = [
  "symbol_search_request",
  "symbol_search_hot_key",
  "header_symbol_search",
  "border_around_the_chart",
  "header_saveload",
  "header_screenshot",
  "volume_force_overlay",

  // "timeframes_toolbar",
  // "header_widget",
  // "use_localstorage_for_settings",
  // "context_menus",
  // "display_market_status",
  "timeframes_toolbar",
  // "header_undo_redo",
  // "header_interval_dialog_button",
  // "control_bar",
  // "border_around_the_chart",
  // "header_widget",
  // "chart_property_page_scales",
];

export interface Candle {
  close: number;
  high: number;
  low: number;
  time: number;
  open: number;
  volume: number;
}

export interface Trade {
  price: string;
  filled_amount: string;
  buyer_is_taker: boolean;
  created_at: string;
  txid?: string;
}
