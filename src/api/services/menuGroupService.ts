import apiClient from "../apiClient";

import type { MenuGroup, PageList } from "#/entity";

export enum MenuGroupClient {
	MenuGroup = "/menu_group",
	SearchMenuGroup = "/menu_group/search",
}
const getDictionaries = () =>
	apiClient.get<MenuGroup[]>({
		url: `${MenuGroupClient.MenuGroup}`,
	});
const updateMenuGroup = (id: number, apiInfo: MenuGroup) =>
	apiClient.put<MenuGroup>({
		url: `${MenuGroupClient.MenuGroup}/${id}`,
		data: apiInfo,
	});

const createMenuGroup = (apiInfo: MenuGroup) =>
	apiClient.post<MenuGroup>({
		url: `${MenuGroupClient.MenuGroup}`,
		data: apiInfo,
	});

const searchPageList = (searchStr: string) =>
	apiClient.get<PageList<MenuGroup>>({
		url: `${MenuGroupClient.SearchMenuGroup}?${searchStr}`,
	});

const deleteMenuGroup = (id: number) =>
	apiClient.delete<string>({
		url: `${MenuGroupClient.MenuGroup}/${id}`,
	});

export default {
	updateMenuGroup,
	searchPageList,
	createMenuGroup,
	deleteMenuGroup,
	getDictionaries,
};
