import apiClient from "../apiClient";

import type { MenuParameter } from "#/entity";

export enum MenuParameterClient {
	MenuParameter = "/menu_parameter",
}
const getMenuParameters = (MenuId: number) =>
	apiClient.get<MenuParameter[]>({
		url: `${MenuParameterClient.MenuParameter}?menu_id=${MenuId}`,
	});
const updateMenuParameter = (id: number, apiInfo: MenuParameter) =>
	apiClient.put<MenuParameter>({
		url: `${MenuParameterClient.MenuParameter}/${id}`,
		data: apiInfo,
	});

const createMenuParameter = (apiInfo: MenuParameter) =>
	apiClient.post<MenuParameter>({
		url: `${MenuParameterClient.MenuParameter}`,
		data: apiInfo,
	});

const deleteMenuParameter = (id: number) =>
	apiClient.delete<string>({
		url: `${MenuParameterClient.MenuParameter}/${id}`,
	});

export default {
	updateMenuParameter,
	createMenuParameter,
	deleteMenuParameter,
	getMenuParameters,
};
