import apiClient from "../apiClient";

import type { MenuBtn } from "#/entity";

export enum MenuBtnClient {
	MenuBtn = "/menu_btn",
}
const getMenuBtns = (menuId: number) =>
	apiClient.get<MenuBtn[]>({
		url: `${MenuBtnClient.MenuBtn}?menu_id=${menuId}`,
	});
const updateMenuBtn = (id: number, apiInfo: MenuBtn) =>
	apiClient.put<MenuBtn>({
		url: `${MenuBtnClient.MenuBtn}/${id}`,
		data: apiInfo,
	});

const createMenuBtn = (apiInfo: MenuBtn) =>
	apiClient.post<MenuBtn>({
		url: `${MenuBtnClient.MenuBtn}`,
		data: apiInfo,
	});

const deleteMenuBtn = (id: number) =>
	apiClient.delete<string>({
		url: `${MenuBtnClient.MenuBtn}/${id}`,
	});

export default {
	updateMenuBtn,
	createMenuBtn,
	deleteMenuBtn,
	getMenuBtns,
};
