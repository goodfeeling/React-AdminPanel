import axios, {
  type AxiosRequestConfig,
  type AxiosError,
  type AxiosResponse,
} from "axios";

import { t } from "@/locales/i18n";
import userStore, { useUserActions } from "@/store/userStore";
import { toast } from "sonner";
import type { Result } from "#/api";
import { ResultEnum } from "#/enum";
import userService from "./services/userService";

// 创建 axios 实例
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 50000,
  headers: { "Content-Type": "application/json;charset=utf-8" },
});

const LOGIN_PATHNAME = "/auth/login";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];
const processQueue = (error: any, token: string | null = null) => {
  for (const prom of failedQueue) {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  }
  failedQueue = [];
};

// 定义一个全局变量来存储 navigate 函数
let navigateFunction: (path: string) => void;

// 提供一个方法来设置 navigate 函数
export const setNavigateFunction = (navigate: (path: string) => void) => {
  navigateFunction = navigate;
};

// 请求拦截
axiosInstance.interceptors.request.use(
  (config) => {
    const { userToken } = userStore.getState();
    if (userToken?.accessToken) {
      config.headers.Authorization = `Bearer ${userToken?.accessToken}`;
    }
    return config;
  },
  (error) => {
    // 请求错误时做些什么
    return Promise.reject(error);
  }
);

// 响应拦截
axiosInstance.interceptors.response.use(
  (res: AxiosResponse<Result>) => {
    if (!res.data) throw new Error(t("sys.api.apiRequestFailed"));

    const { status = 0, data, message = "" } = res.data;
    // 业务请求成功
    const hasSuccess =
      data && Reflect.has(res.data, "status") && status === ResultEnum.SUCCESS;

    if (hasSuccess) {
      return data;
    }

    // 业务请求错误
    throw new Error(message || t("sys.api.apiRequestFailed"));
  },
  async (error: AxiosError<Result>) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // 检查是否是 401 错误，并且不是重试请求
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 如果已经在刷新 token，将请求加入队列等待
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { userToken, actions } = userStore.getState();
      if (!userToken?.refreshToken) {
        // no refresh token go to login
        useUserActions().clearUserInfoAndToken(); // 清除用户信息和 Token
        if (navigateFunction) {
          navigateFunction(LOGIN_PATHNAME); // 使用全局 navigate 函数跳转到登录页面
        }
        return Promise.reject(
          new Error("Token refresh failed ,token is empty")
        );
      }
      try {
        const response = await userService.refreshToken(
          userToken?.refreshToken
        );
        const { userinfo: userInfo, security } = response;
        const {
          jwtAccessToken,
          jwtRefreshToken,
          expirationAccessDateTime,
          expirationRefreshDateTime,
        } = security;
        // 更新用户信息
        actions.setUserInfo(userInfo);
        actions.setUserToken({
          accessToken: jwtAccessToken,
          refreshToken: jwtRefreshToken,
          expirationAccessDateTime,
          expirationRefreshDateTime,
        });
        processQueue(null, jwtAccessToken);
        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err);
        useUserActions().clearUserInfoAndToken(); // 清除用户信息和 Token
        if (navigateFunction) {
          navigateFunction(LOGIN_PATHNAME); // 使用全局 navigate 函数跳转到登录页面
        }
        return Promise.reject(new Error("Token refresh failed"));
      } finally {
        isRefreshing = false;
      }
    } else {
      const { response, message } = error || {};
      const newError = new Error(
        response?.data?.error || message || t("sys.api.errorMessage")
      );
      toast.error(newError.message, {
        position: "top-center",
      });
      return Promise.reject(newError);
    }
  }
);

class APIClient {
  get<T = any>(config: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: "GET" });
  }

  post<T = any>(config: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: "POST" });
  }

  put<T = any>(config: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: "PUT" });
  }

  delete<T = any>(config: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: "DELETE" });
  }

  request<T = any>(config: AxiosRequestConfig): Promise<T> {
    return new Promise((resolve, reject) => {
      axiosInstance
        .request<any, AxiosResponse<Result>>(config)
        .then((res: AxiosResponse<Result>) => {
          resolve(res as unknown as Promise<T>);
        })
        .catch((e: Error | AxiosError) => {
          reject(e);
        });
    });
  }
}
export default new APIClient();
