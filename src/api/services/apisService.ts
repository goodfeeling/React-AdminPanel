import apiClient from "../apiClient";

import type { Api, PageList } from "#/entity";

export enum ApiApi {
  Api = "/api",
  SearchApi = "/api/search",
  ApiTree = "/api/tree",
}
const getApis = () => apiClient.get<Api[]>({ url: `${ApiApi.Api}` });
const updateApi = (id: number, apiInfo: Api) =>
  apiClient.put<Api>({ url: `${ApiApi.Api}/${id}`, data: apiInfo });

const createApi = (apiInfo: Api) =>
  apiClient.post<Api>({ url: `${ApiApi.Api}`, data: apiInfo });

const searchPageList = (searchStr: string) =>
  apiClient.get<PageList<Api>>({
    url: `${ApiApi.SearchApi}?${searchStr}`,
  });

const deleteApi = (id: number) =>
  apiClient.delete<string>({ url: `${ApiApi.Api}/${id}` });

export default {
  updateApi,
  searchPageList,
  createApi,
  deleteApi,
  getApis,
};
