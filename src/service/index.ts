import { API_PATH } from "@/constant/api-path";
import { clearUser, updateToken } from "@/libs/slices/userSlice";
import makeStore from "@/libs/store";
import axios, { AxiosRequestConfig } from "axios";
import { toast } from "react-toastify";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ENDPOINT_URL || "",
  timeout: 60000,
  // headers: {
  //   "X-TIME-ZONE": new Date().getTimezoneOffset(),
  // },
});

// if the api no need token put it in here.
// const whiteList = [API_PATH.AUTH.REFRESH_TOKEN];

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  (config) => {
    if (!navigator.onLine) {
      const action = config.headers["action"];
      if (action) toast.error(`There was a network error`);
      throw new Error("Network Error", { cause: "offline" });
    }

    const accessToken = makeStore.getState().user.accessToken;
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    // }
    if (!accessToken) {
      delete config.headers["Authorization"];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const handleSesstionExpired = () => {
  localStorage.clear();
  // store.dispatch(openModal("dialog:SessionExpired"));
  // store.dispatch(rememberPassword(false));
};

const handleRefreshTokenExpired = () => {
  localStorage.clear();
  // store.dispatch(openModal("dialog:SessionExpired"));
};

axiosInstance.interceptors.response.use(
  (res) => {
    return res;
  },
  async (err) => {
    const originalConfig = err.config;
    // logout user's session if refresh token api responds 401 UNAUTHORIZED
    const httpStatus = err.response?.status;
    const message = err.response?.data?.message;
    // if (httpStatus === 401 || message === "Unauthorized") {
    //   makeStore.dispatch(clearUser());
    // }
    // if request fails with 401 UNAUTHORIZED status
    // then it calls the api to generate new access token
    // const { isRememberPassword } = store.getState().settings;
    // const lastUserActiveDate = localStorage.getItem(
    //   LocalStorageKeys.LAST_USER_ACTIVE
    // );
    // const isActiveUserDateValid: boolean =
    //   dayjs().diff(lastUserActiveDate, "m") <
    //   (import.meta.env.VITE_ACCESS_TOKEN_TIME || 1440); // mins
    if (message === "Unauthorized") {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalConfig.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalConfig);
          })
          .catch((err) => Promise.reject(err));
      }

      originalConfig._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = makeStore.getState().user.refreshToken;
        const response = await axiosInstance.post(API_PATH.AUTH.REFRESH_TOKEN, {
          refresh_token: refreshToken,
        });
        const { access_token, refresh_token } = response.data.data;
        makeStore.dispatch(
          updateToken({
            accessToken: access_token,
            refreshToken: refresh_token,
          })
        );

        originalConfig.headers.Authorization = `Bearer ${access_token}`;
        processQueue(null, access_token);
        return axiosInstance(originalConfig);
      } catch (error) {
        processQueue(err as Error, null);
        makeStore.dispatch(clearUser());
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export const getAPI = (
  url: string,
  config?: AxiosRequestConfig<any> | undefined
) => {
  return axiosInstance.get(url, config);
};
export const postAPI = (
  url: string,
  data?: any,
  config?: AxiosRequestConfig<any> | undefined
) => {
  return axiosInstance.post(url, data, config);
};

export const postFormDataAPI = (url: string, data?: any, config?: any) => {
  return axiosInstance.post(url, data, config);
};

export const putAPI = (
  url: string,
  data?: any,
  config?: AxiosRequestConfig<any> | undefined
) => {
  return axiosInstance.put(url, data, config);
};
export const patchAPI = (
  url: string,
  data?: any,
  config?: AxiosRequestConfig<any> | undefined
) => {
  return axiosInstance.patch(url, data, config);
};
export const deleteAPI = (
  url: string,
  config?: AxiosRequestConfig<any> | undefined
) => {
  return axiosInstance.delete(url, config);
};

export const fetcher = (data: string[]) => {
  const [url, token, params] = data;
  if (url) {
    return axiosInstance
      .get(url, {
        params,
        headers: { Authorization: "Bearer " + token },
      })
      .then((res) => res.data.data);
  }
};
