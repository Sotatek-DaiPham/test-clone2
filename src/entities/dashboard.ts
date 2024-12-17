export interface ITokenDashboardResponse {
  id: number;
  contractAddress: string;
  name: string;
  description: string;
  avatar: string;
  decimal: number;
  total_supply: string;
  timestampCreated: null;
  progressToListDex: number;
  timeToListDex: null;
  userWalletAddress: string;
  userAvatar: null;
  username: string;
  numberView: string;
  rate: string;
  volume: string;
  numberTransaction: string;
  createdAt: string;
}

export interface IKingOfTheSkyResponse {
  id: number;
  contractAddress: string;
  name: string;
  description: string;
  avatar: string;
  decimal: number;
  total_supply: string;
  userAvatar: null;
  username: string;
  userWalletAddress: string;
  progressToListDex: number;
  volume: string;
  numberTransaction: string;
  createdAt: string;
}
export interface ITradeHistoryResponse {
  action: string;
  amount: string;
  created_at: string;
  decimal: number;
  symbol: string;
  token_id: number;
  token_address: string;
  token_avatar: string;
  token_name: string;
  updated_at: string;
  usdt_amount: string;
  user_address: string;
  user_avatar: any;
  username: string;
}
