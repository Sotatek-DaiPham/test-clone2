export interface INotificationResponse {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: any;
  userId: number;
  title: string;
  description: any;
  information: Information;
  isRead: boolean;
  isOpen: boolean;
}

export interface Information {
  userId: number;
  action: string;
  tokenAddress: string;
  walletAddress: string;
  amount: string;
  ethAmount: string;
  token: Token;
  usernamme: string;
}

export interface Token {
  id: number;
  createdAt: string;
  updatedAt: string;
  contractAddress: string;
  idx: string;
  symbol: string;
  name: string;
  description: string;
  avatar: string;
  tokenFactory: string;
  decimal: number;
  total_supply: string;
  owner: string;
  timestampCreated: any;
  initEthReserve: string;
  kingOfTheHillDate: any;
  website: any;
  twitter: any;
  telegram: any;
  discord: any;
  devWallet: string;
  isListedOnDex: boolean;
  timeToListDex: any;
  pairListDex: any;
  progressToListDex: number;
  price: string;
}
