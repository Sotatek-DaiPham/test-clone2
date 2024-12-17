export interface MyProfileResponse {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  walletAddress: string;
  username: string;
  bio: any;
  avatar: any;
  status: string;
  likedReceived: number;
  mentionsReceived: number;
  numberFollower: number;
  isFollowing?: boolean;
}

export interface UpdateProfilePayload {
  username: string;
  bio?: string;
  avatar?: any;
}

export type TUpdateProfilePayload = {
  username: string;
  bio?: string;
  avatar?: any;
};

export interface IMyRepliesResponse {
  id: number;
  deletedAt: any;
  userId: number;
  tokenId: number;
  replyId: number;
  replyUserId: number;
  content: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  userName: string;
  avatar: string;
  walletAddress: string;
}

export interface IFollowerResponse {
  id: number;
  wallet_address: string;
  username: string;
  bio: string;
  avatar: string;
  numberFollower: number;
  isFollowing: boolean;
}

export interface IProjectCardResponse {
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
  amount: string;
  price: string;
  symbol: string;
  numberTransaction: number;
  numberView: number;
  timeToListDex: number;
  volume: number;
  createdAt: string;
}

export enum ETabsMyProfile {
  MY_PROFILE = "my-profile",
  PORTFOLIO = "portfolio",
  COIN_CREATED = "coin-created",
  FOLLOWERS = "followers",
  FOLLOWING = "following",
  MY_REPLIES = "my-replies",
}

export interface DiscussionThreadItem {
  comment_id: number;
  user_id: number;
  token_id: number;
  reply_id: number | null;
  reply_user_id: number | null;
  image: string;
  content: string;
  created_at: string;
  updated_at: string;
  wallet_address: string;
  username: string;
  avatar: string | null;
  number_replies: number;
  mostRecentUserComments: IMostRecentUserComment[];
}

export interface IMostRecentUserComment {
  id: number;
  reply_id: number;
  user_id: number;
  wallet_address: string;
  avatar: string;
}

export interface IReplyThreadItem {
  avatar: string;
  comment_id: number;
  content: string;
  created_at: string;
  image: string;
  number_replies: number;
  reply_id: number;
  reply_user_id: number;
  token_id: number;
  updated_at: string;
  user_id: number;
  username: string;
  wallet_address: string;
}
