export const PATH_ROUTER = {
  DASHBOARD: "/",
  MY_PROFILE: "/my-profile",
  NOTIFICATION: "/notification",
  MY_TOKENS: "/my-tokens",
  LEADER_BOARD: "/leader-board",
  TOKEN_DETAIL: (id: any) => `/token-detail/${id}`,
  CREATE_TOKEN: "/create-token",
  USER_PROFILE: (address: any) => `/user/${address}`,
};
