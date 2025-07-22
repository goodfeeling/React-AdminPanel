import apiClient from "../apiClient";

import type { PageList, Role, RoleTree, roleSetting } from "#/entity";

export interface UpdateRole {
	parent_id: number;
	name: string;
	label: string;
	status: boolean;
	order: number;
	description: string;
}
export enum RoleApi {
	Role = "/role",
	SearchRole = "/role/search",
	RoleTree = "/role/tree",
}
const getRoles = (status = 0) => apiClient.get<Role[]>({ url: `${RoleApi.Role}?status=${status}` });
const updateUser = (id: number, userInfo: UpdateRole) =>
	apiClient.put<Role>({ url: `${RoleApi.Role}/${id}`, data: userInfo });

const createUser = (userInfo: Role) => apiClient.post<Role>({ url: `${RoleApi.Role}`, data: userInfo });

const searchPageList = (searchStr: string) =>
	apiClient.get<PageList<Role>>({
		url: `${RoleApi.SearchRole}?${searchStr}`,
	});

const deleteUser = (id: number) => apiClient.delete<string>({ url: `${RoleApi.Role}/${id}` });

const getRoleTree = () => apiClient.get<RoleTree>({ url: `${RoleApi.RoleTree}` });

const getRoleSetting = (id: number) => apiClient.get<roleSetting>({ url: `${RoleApi.Role}/${id}/setting` });

const updateRoleMenus = (id: number, menuIds: number[]) =>
	apiClient.post<boolean>({
		url: `${RoleApi.Role}/${id}/menu`,
		data: { menuIds },
	});

const updateRoleApis = (id: number, apiPaths: string[]) =>
	apiClient.post<boolean>({
		url: `${RoleApi.Role}/${id}/api`,
		data: { apiPaths },
	});

export default {
	updateUser,
	searchPageList,
	createUser,
	deleteUser,
	getRoleTree,
	getRoles,
	getRoleSetting,
	updateRoleMenus,
	updateRoleApis,
};
