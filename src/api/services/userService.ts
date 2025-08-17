import apiClient from "../apiClient";

import type { PageList, PasswordEditReq, UpdateUser, UserInfo } from "#/entity";

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
	SwitchRole = "/auth/switch-role",

	User = "/user",
	SearchUser = "/user/search",
}

const signin = (data: SignInReq) => apiClient.post<SignInRes>({ url: UserApi.SignIn, data });
const signup = (data: SignUpReq) => apiClient.post<SignInRes>({ url: UserApi.SignUp, data });
const logout = () => apiClient.get({ url: UserApi.Logout });

const refreshToken = async (refreshToken: string) =>
	apiClient.post({
		url: UserApi.Refresh,
		data: {
			refreshToken,
		},
	});
const findById = (id: string) => apiClient.get<UserInfo[]>({ url: `${UserApi.User}/${id}` });

const updateUser = (id: number, userInfo: UpdateUser) =>
	apiClient.put<UserInfo>({ url: `${UserApi.User}/${id}`, data: userInfo });

const createUser = (userInfo: UserInfo) => apiClient.post<UserInfo>({ url: `${UserApi.User}`, data: userInfo });

const searchPageList = (searchStr: string) =>
	apiClient.get<PageList<UserInfo>>({
		url: `${UserApi.SearchUser}?${searchStr}`,
	});

const deleteUser = (id: number) => apiClient.delete<string>({ url: `${UserApi.User}/${id}` });

const bindRole = (userId: number, roleIds: string[]) =>
	apiClient.post<boolean>({
		url: `${UserApi.User}/${userId}/role`,
		data: {
			roleIds,
		},
	});

const resetPassword = (id: number) =>
	apiClient.post<boolean>({
		url: `${UserApi.User}/${id}/reset-password`,
	});
const editPassword = (id: number, updateInfo: PasswordEditReq) =>
	apiClient.post<boolean>({
		url: `${UserApi.User}/${id}/edit-password`,
		data: updateInfo,
	});
const switchRole = (roleId: number) =>
	apiClient.post<SignInRes>({
		url: `${UserApi.SwitchRole}?role_id=${roleId}`,
	});

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
	bindRole,
	resetPassword,
	switchRole,
	editPassword,
};
