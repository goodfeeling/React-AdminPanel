import apiClient from "../apiClient";

import type { FileInfo, PageList } from "#/entity";

export enum FileInfoClient {
	FileInfo = "/api",
	SearchFileInfo = "/api/search",
	GroupsFileInfo = "/api/groups",
	DeleteBatch = "/api/batch",
}
const getFileInfos = () => apiClient.get<FileInfo[]>({ url: `${FileInfoClient.FileInfo}` });
const updateFileInfo = (id: number, apiInfo: FileInfo) =>
	apiClient.put<FileInfo>({
		url: `${FileInfoClient.FileInfo}/${id}`,
		data: apiInfo,
	});

const createFileInfo = (apiInfo: FileInfo) =>
	apiClient.post<FileInfo>({
		url: `${FileInfoClient.FileInfo}`,
		data: apiInfo,
	});

const searchPageList = (searchStr: string) =>
	apiClient.get<PageList<FileInfo>>({
		url: `${FileInfoClient.SearchFileInfo}?${searchStr}`,
	});

const deleteFileInfo = (id: number) => apiClient.delete<string>({ url: `${FileInfoClient.FileInfo}/${id}` });

const deleteBatch = (ids: number[]) =>
	apiClient.post<number>({
		url: `${FileInfoClient.DeleteBatch}`,
		data: { ids },
	});

export default {
	updateFileInfo,
	searchPageList,
	createFileInfo,
	deleteFileInfo,
	getFileInfos,
	deleteBatch,
};
