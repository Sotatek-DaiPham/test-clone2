export interface ICreateTokenReq {
  symbol: string;
  name: string;
  description: string;
  avatar?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
}

export interface ICreateTokenRes {
  idx: string;
  symbol: string;
  name: string;
  tokenFactory: string;
  total_supply: string;
  owner: string;
  initEthReserve: string;
  website: string;
  twitter: string;
  telegram: string;
  discord: string;
  createdAt: string;
  updatedAt: string;
  contractAddress: string | null;
  description: string | null;
  avatar: string | null;
  id: number;
  decimal: number;
}

export enum ECoinType {
  MemeCoin = "MemeCoin",
  StableCoin = "StableCoin",
}

export interface ITokenDetailRes {
  avatar: string;
  contractAddress: string;
  createdAt: string | null;
  decimal: number;
  description: string;
  discord: string | null;
  id: number;
  idx: string;
  kingOfTheHillDate: string;
  name: string;
  numberTransaction: string;
  pairListDex: string | null;
  price: string;
  progressToListDex: number;
  symbol: string;
  telegram: string | null;
  timeToListDex: string | null;
  total_supply: string;
  twitter: string | null;
  userAvatar: string | null;
  userWalletAddress: string;
  username: string;
  volume: string;
  website: string | null;
}

export interface TokenDetailSC {
  symbol: string;
  tokenVirtualReserve: string;
  usdtVirtualReserve: string;
  isListed: boolean;
  tokensSold: string;
  usdtRaised: string;
  id: string;
  devWallet: string;
}

export interface ITradeHistoryRes {
  user_address: string;
  token_address: string;
  amount: string;
  eth_amount: string;
  action: string;
  created_at: string;
  updated_at: string;
  username: string;
  user_avatar: string | null;
  txh: string;
  timestamp_created: string;
}

export interface IGetTradeHistoryParams {
  orderBy?: string;
  direction?: string;
  page?: number;
  limit?: number;
  tokenAddress?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}

export interface IGetHolderDistributeParams {
  orderBy?: string;
  direction?: string;
  page?: number;
  limit?: number;
  tokenAddress: string;
}

export interface IGetHolderRes {
  user_address: string;
  amount: string;
  total_supply: string;
  percent: string;
}

export interface ISocketData {
  data: {
    action: string;
    amount: string;
    createdAt: string;
    deletedAt: string | null;
    fee: string;
    id: number;
    price: string;
    timestampCreated: number;
    tokenAddress: string;
    tokenAvatar: string;
    tokenName: string;
    txh: string;
    updatedAt: string;
    ethAmount: string;
    userAddress: string;
    userAvatar: string | null;
    username: string;
  };
  event: string;
}

export interface ISaveTradeSettingsReq {
  id?: number;
  slippage: string;
  fontRunning: boolean;
  priorityFee: string;
}
export interface ISaveTradeSettingsRes {
  id?: number;
  slippage: string;
  priorityFee: string;
  fontRunning: boolean;
}
