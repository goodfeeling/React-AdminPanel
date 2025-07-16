import apiClient from "../apiClient";

import type { PageList, UpdateUser, UserInfo } from "#/entity";
import refreshClient from "../refreshClient";

export interface SignInReq {
	user_name: string;
	password: string;
}

export interface SignUpReq extends SignInReq {
	email: string;
}
export type SignInRes = {
	security: {
		expirationAccessDateTime: string;
		expirationRefreshDateTime: string;
		jwtAccessToken: string;
		jwtRefreshToken: string;
	};
	userinfo: UserInfo;
};

export enum UserApi {
	SignIn = "/auth/signin",
	SignUp = "/auth/signup",
	Logout = "/auth/logout",
	Refresh = "/auth/access-token",
	User = "/user",
	SearchUser = "/user/search",
}

const signin = (data: SignInReq) => apiClient.post<SignInRes>({ url: UserApi.SignIn, data });
const signup = (data: SignUpReq) => apiClient.post<SignInRes>({ url: UserApi.SignUp, data });
const logout = () => apiClient.get({ url: UserApi.Logout });
// const refreshToken = (refreshToken: string) =>
// 	apiClient.post<SignInRes>({ url: UserApi.Refresh, data: { refreshToken } });

const refreshToken = async (refreshToken: string) => {
	try {
		const response = await refreshClient.post(UserApi.Refresh, {
			refreshToken,
		});

		return response.data; // 假设返回新的 accessToken 和 refreshToken
	} catch (error) {
		console.error("Token refresh failed:", error);
		throw error;
	}
};
const findById = (id: string) => apiClient.get<UserInfo[]>({ url: `${UserApi.User}/${id}` });

const updateUser = (id: number, userInfo: UpdateUser) =>
	apiClient.put<UserInfo>({ url: `${UserApi.User}/${id}`, data: userInfo });

const createUser = (userInfo: UserInfo) => apiClient.post<UserInfo>({ url: `${UserApi.User}`, data: userInfo });

const searchPageList = (searchStr: string) =>
	apiClient.get<PageList<UserInfo>>({
		url: `${UserApi.SearchUser}?${searchStr}`,
	});

const deleteUser = (id: number) => apiClient.delete<string>({ url: `${UserApi.User}/${id}` });

export default {
	signin,
	signup,
	findById,
	logout,
	updateUser,
	refreshToken,
	searchPageList,
	createUser,
	deleteUser,
};
