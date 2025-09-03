import axios, { type AxiosRequestConfig, type AxiosError, type AxiosResponse } from "axios";

import { t } from "@/locales/i18n";
import userStore from "@/store/userStore";
import { Modal } from "antd";
import { toast } from "sonner";
import type { Result } from "#/api";
import { PagePath, ResultEnum, StorageEnum } from "#/enum";
import userService, { UserApi } from "./services/userService";

// 创建 axios 实例
const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_APP_BASE_API,
	timeout: 50000,
	headers: { "Content-Type": "application/json;charset=utf-8" },
});

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
	},
);

// 响应拦截
axiosInstance.interceptors.response.use(
	(res: AxiosResponse<Result>) => {
		if (!res.data) throw new Error(t("sys.api.apiRequestFailed"));

		const { status = 0, data, message = "" } = res.data;
		// 业务请求成功
		const hasSuccess = data && Reflect.has(res.data, "status") && status === ResultEnum.SUCCESS;

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

		error.response?.status === 401 && handleAuthError(error);

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
				clearUserTokenToLoginPage("Token refresh failed ,token is empty");
				return Promise.reject(new Error("Token refresh failed ,token is empty"));
			}

			try {
				const response = await userService.refreshToken(userToken?.refreshToken);

				const { jwtAccessToken, jwtRefreshToken, expirationAccessDateTime, expirationRefreshDateTime } =
					response.security;
				actions.setUserToken({
					accessToken: jwtAccessToken,
					refreshToken: jwtRefreshToken,
					expirationAccessDateTime,
					expirationRefreshDateTime,
				});
				processQueue(null, jwtAccessToken);
				return axiosInstance(originalRequest);
			} catch (err) {
				console.log(err);
				processQueue(err);
				clearUserTokenToLoginPage(err);
				return Promise.reject(new Error("Token refresh failed"));
			} finally {
				isRefreshing = false;
			}
		} else {
			const { response, message } = error || {};
			const newError = new Error(response?.data?.error || message || t("sys.api.errorMessage"));
			toast.error(newError.message, {
				position: "top-center",
			});
			return Promise.reject(newError);
		}
	},
);

// handler Error
function handleAuthError(error: AxiosError<Result<any>, any>) {
	if (error.response?.data.error === "Token has been replaced") {
		clearUserTokenToLoginPage(error.response.data.error);
		return Promise.reject(new Error(error.response.data.error));
	}

	// token invalid or expire
	if (
		(error.response?.data.error === "Invalid token" || error.response?.data.error === "Token expired") &&
		error.request.responseURL.includes(UserApi.Refresh)
	) {
		clearUserTokenToLoginPage(error.response.data.error);
		return Promise.reject(new Error(error.response.data.error));
	}
}

// clear user token
function clearUserTokenToLoginPage(message: string | undefined) {
	// clear localStorage in user store
	localStorage.removeItem(StorageEnum.STSToken);
	localStorage.removeItem(StorageEnum.UserStore);
	localStorage.removeItem(StorageEnum.Menu);
	let title = "";
	let content = "";

	switch (message) {
		case "Token has been replaced":
			title = "账号已在别处登录";
			content = "您的账号在另一台设备上登录，当前会话已被终止。请重新登录。";
			break;
		case "Invalid token":
		case "Token expired":
			title = "令牌失效提示";
			content = "令牌已过期，请重新登录";
			break;
		default:
			title = "系统错误提示";
			content = message || "系统错误，请联系管理员";
			break;
	}
	Modal.warning({
		title,
		content,
		okText: "重新登录",
		onOk: () => {
			window.location.replace(`#${PagePath.Login}`);
			window.location.reload();
		},
	});
}

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
