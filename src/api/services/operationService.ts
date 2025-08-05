import apiClient from "../apiClient";

import type { Operation, PageList } from "#/entity";

export enum OperationApi {
	Operation = "/operation",
	OperationDeleteBatch = "/operation/delete-batch",
	OperationSearch = "/operation/search",
}

const searchPageList = (searchStr: string) =>
	apiClient.get<PageList<Operation>>({
		url: `${OperationApi.OperationSearch}?${searchStr}`,
	});
const deleteOperation = (id: number) => apiClient.delete<string>({ url: `${OperationApi.Operation}/${id}` });
const deleteBatch = (ids: number[]) =>
	apiClient.post<number[]>({
		url: OperationApi.OperationDeleteBatch,
		data: {
			ids,
		},
	});

export default {
	searchPageList,
	deleteBatch,
	deleteOperation,
};
