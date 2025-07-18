import apiClient from "../apiClient";

import type { Menu, MenuTreeUserGroup, PageList } from "#/entity";

export enum MenuApi {
	Menu = "/menu",
	SearchMenu = "/menu/search",
	UserMenu = "/menu/user",
}
const getMenus = (groupId: number) => apiClient.get<Menu[]>({ url: `${MenuApi.Menu}?group_id=${groupId}` });
const updateMenu = (id: number, userInfo: Menu) =>
	apiClient.put<Menu>({ url: `${MenuApi.Menu}/${id}`, data: userInfo });

const createMenu = (userInfo: Menu) => apiClient.post<Menu>({ url: `${MenuApi.Menu}`, data: userInfo });

const searchPageList = (searchStr: string) =>
	apiClient.get<PageList<Menu>>({
		url: `${MenuApi.SearchMenu}?${searchStr}`,
	});

const deleteMenu = (id: number) => apiClient.delete<string>({ url: `${MenuApi.Menu}/${id}` });

const getUserMenu = () => apiClient.get<MenuTreeUserGroup[]>({ url: `${MenuApi.UserMenu}` });

export default {
	updateMenu,
	searchPageList,
	createMenu,
	deleteMenu,
	getMenus,
	getUserMenu,
};
