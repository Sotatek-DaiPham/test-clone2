export const SEARCH_PARAMS = {
  terminal: {
    tab: "tab",
    filter: "filter",
    top: "top",
    rising: "rising",
    finalized: "finalized",
    age: "age",
    minProgress: "minProgress",
    maxProgress: "maxProgress",
  },
  myProfile: {
    tab: "tab",
    search: "search",
  },
  reply: {
    replyId: "replyId",
    replyUserId: "replyUserId",
  },
  howItWorks: "how-it-works",
} as const;

export type ExtractKeyType<T, K extends keyof T> = T[K][keyof T[K]];
export type TypeSearchParams<K extends keyof typeof SEARCH_PARAMS> =
  ExtractKeyType<typeof SEARCH_PARAMS, K>;
