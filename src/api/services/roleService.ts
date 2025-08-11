import apiClient from "../apiClient";

import type { PageList, Role, RoleTree, roleSetting } from "#/entity";

export interface UpdateRole {
	parent_id: number;
	name: string;
	label: string;
	status: number;
	order: number;
	description: string;
}
export enum RoleApi {
	Role = "/role",
	SearchRole = "/role/search",
	RoleTree = "/role/tree",
}
const getRoles = (status = 0) => apiClient.get<Role[]>({ url: `${RoleApi.Role}?status=${status}` });
const updateRole = (id: number, info: UpdateRole) => apiClient.put<Role>({ url: `${RoleApi.Role}/${id}`, data: info });

const createRole = (info: Role) => apiClient.post<Role>({ url: `${RoleApi.Role}`, data: info });

const searchPageList = (searchStr: string) =>
	apiClient.get<PageList<Role>>({
		url: `${RoleApi.SearchRole}?${searchStr}`,
	});

const deleteRole = (id: number) => apiClient.delete<string>({ url: `${RoleApi.Role}/${id}` });

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
const updateRoleBtns = (id: number, menuId: number, btnIds: number[]) =>
	apiClient.post<boolean>({
		url: `${RoleApi.Role}/${id}/menu-btns`,
		data: { btnIds, menuId },
	});

const updateDefaultRouter = (id: number, routerPath: string) =>
	apiClient.put<Role>({
		url: `${RoleApi.Role}/${id}`,
		data: { default_router: routerPath },
	});
export default {
	updateRole,
	searchPageList,
	createRole,
	deleteRole,
	getRoleTree,
	getRoles,
	getRoleSetting,
	updateRoleMenus,
	updateRoleApis,
	updateRoleBtns,
	updateDefaultRouter,
};
