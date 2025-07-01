import apiClient from "../apiClient";

import type { PageList, Role } from "#/entity";

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
}
const updateUser = (id: number, userInfo: UpdateRole) =>
  apiClient.put<Role>({ url: `${RoleApi.Role}/${id}`, data: userInfo });

const createUser = (userInfo: Role) =>
  apiClient.post<Role>({ url: `${RoleApi.Role}`, data: userInfo });

const searchPageList = (searchStr: string) =>
  apiClient.get<PageList<Role>>({
    url: `${RoleApi.SearchRole}?${searchStr}`,
  });

const deleteUser = (id: number) =>
  apiClient.delete<string>({ url: `${RoleApi.Role}/${id}` });

export default {
  updateUser,
  searchPageList,
  createUser,
  deleteUser,
};
