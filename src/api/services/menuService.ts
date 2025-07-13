import apiClient from "../apiClient";

import type { Menu, MenuTree, PageList } from "#/entity";

export enum MenuApi {
  Menu = "/menu",
  SearchMenu = "/menu/search",
  MenuTree = "/menu/tree",
}
const getMenus = () => apiClient.get<Menu[]>({ url: `${MenuApi.Menu}` });
const updateMenu = (id: number, userInfo: Menu) =>
  apiClient.put<Menu>({ url: `${MenuApi.Menu}/${id}`, data: userInfo });

const createMenu = (userInfo: Menu) =>
  apiClient.post<Menu>({ url: `${MenuApi.Menu}`, data: userInfo });

const searchPageList = (searchStr: string) =>
  apiClient.get<PageList<Menu>>({
    url: `${MenuApi.SearchMenu}?${searchStr}`,
  });

const deleteMenu = (id: number) =>
  apiClient.delete<string>({ url: `${MenuApi.Menu}/${id}` });

const getMenuTree = () =>
  apiClient.get<MenuTree>({ url: `${MenuApi.MenuTree}` });

export default {
  updateMenu,
  searchPageList,
  createMenu,
  deleteMenu,
  getMenuTree,
  getMenus,
};
