export type BeSuccessResponse<T> = {
  status_code: number;
  data: T;
  message: string;
};
export type TDefaultGetParams = {
  pageNo?: number;
  pageSize?: number;
  sort?: string;
  sortBy?: string;
};
