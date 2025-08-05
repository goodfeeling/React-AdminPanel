import apiClient from "../apiClient";

import type { Api, ApiGroupItem, PageList } from "#/entity";

export enum ApiClient {
	Api = "/api",
	SearchApi = "/api/search",
	GroupsApi = "/api/groups",
	DeleteBatch = "/api/batch",
	ApiGroupList = "/api/group-list",
	ApiSynchronize = "/api/synchronize",
}
const getApis = () => apiClient.get<Api[]>({ url: `${ApiClient.Api}` });
const updateApi = (id: number, apiInfo: Api) => apiClient.put<Api>({ url: `${ApiClient.Api}/${id}`, data: apiInfo });

const createApi = (apiInfo: Api) => apiClient.post<Api>({ url: `${ApiClient.Api}`, data: apiInfo });

const searchPageList = (searchStr: string) =>
	apiClient.get<PageList<Api>>({
		url: `${ApiClient.SearchApi}?${searchStr}`,
	});

const deleteApi = (id: number) => apiClient.delete<string>({ url: `${ApiClient.Api}/${id}` });

const deleteBatch = (ids: number[]) => apiClient.post<number>({ url: `${ApiClient.DeleteBatch}`, data: { ids } });

const getApiGroupList = () => apiClient.get<ApiGroupItem[]>({ url: `${ApiClient.ApiGroupList}` });

const synchronizeApi = () => apiClient.post<{ count: number }>({ url: `${ApiClient.ApiSynchronize}` });

export default {
	updateApi,
	searchPageList,
	createApi,
	deleteApi,
	getApis,
	deleteBatch,
	getApiGroupList,
	synchronizeApi,
};
