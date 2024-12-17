export const ErrorCode = {
  MetamaskDeniedTx: "ACTION_REJECTED",
  INSUFFICIENT_FEE: -32603,
  SLIPPAGE_ERROR: "Pump: INSUFFICIENT_OUTPUT_AMOUNT",
  TOKEN_ALREADY_MINTED: "Pump: ID already exists",
  TRANSACTION_REVERTED: "execution reverted (unknown custom error)",
};

export const LIMIT_ITEMS_TABLE = 10;
export const LIMIT_COIN_ITEMS_TABLE = 100;

export const MINIMUM_BUY_AMOUNT = 0.0001;

export const DECIMAL_DISPLAY = 6;

export const NATIVE_TOKEN_DECIMAL = 1e18;

export const TOKEN_DECIMAL = 1e18;

export const ETH_THRESHOLD = 3.5;
// export const ETH_THRESHOLD = 0.5;

export const ETH_THRESHOLD_WITH_FEE = 3.535;
// export const ETH_THRESHOLD_WITH_FEE = 0.505;

export const PREDEFINE_AMOUNT = ["0.005", "0.01", "0.05", "0.1", "0.5"];

export const PREDEFINE_SELL_PERCENT = ["10%", "25%", "50%", "75%", "100%"];

export const PREDEFINE_SLIPPAGE = ["05", "10", "15", "20", "25"];

export const PREDEFINE_PRIORITY_FEE = ["0.0001", "0.0002", "0.0003", "0.0004"];

export const AMOUNT_FIELD_NAME = "amount";

export const ACCEPT_IMAGE_EXTENSION = ".png,.jpg,.jpeg,.gif";

export const GAS_FEE_BUFFER = 1.2;

export enum ETradeAction {
  BUY = "BUY",
  SELL = "SELL",
}

export enum EDirection {
  ASC = "ASC",
  DESC = "DESC",
}

export const DEFAULT_AVATAR =
  "https://nft-ticket-the-bucket.s3.ap-southeast-1.amazonaws.com/images/d76403890c-image.png";

export enum EEventNoti {
  TOKEN_CREATED = "TokenCreated",
  BUY = "Buy",
  SELL = "Sell",
  TOKEN_LISTED = "TokenListed",
}

export const TOKEN_DECIMAL_PLACE = 18;
