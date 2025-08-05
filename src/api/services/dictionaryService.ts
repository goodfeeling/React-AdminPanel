import apiClient from "../apiClient";

import type { Dictionary, PageList } from "#/entity";

export enum DictionaryClient {
	Dictionary = "/dictionary",
	SearchDictionary = "/dictionary/search",
	GroupsDictionary = "/dictionary/groups",
	DeleteBatch = "/dictionary/batch",
	Type = "/dictionary/type",
}
const getDictionaries = () =>
	apiClient.get<Dictionary[]>({
		url: `${DictionaryClient.Dictionary}`,
	});
const updateDictionary = (id: number, apiInfo: Dictionary) =>
	apiClient.put<Dictionary>({
		url: `${DictionaryClient.Dictionary}/${id}`,
		data: apiInfo,
	});

const createDictionary = (apiInfo: Dictionary) =>
	apiClient.post<Dictionary>({
		url: `${DictionaryClient.Dictionary}`,
		data: apiInfo,
	});

const searchPageList = (searchStr: string) =>
	apiClient.get<PageList<Dictionary>>({
		url: `${DictionaryClient.SearchDictionary}?${searchStr}`,
	});

const deleteDictionary = (id: number) =>
	apiClient.delete<string>({
		url: `${DictionaryClient.Dictionary}/${id}`,
	});

const deleteBatch = (ids: number[]) =>
	apiClient.post<number>({
		url: `${DictionaryClient.DeleteBatch}`,
		data: { ids },
	});
const getByType = (type: string) =>
	apiClient.get<Dictionary>({
		url: `${DictionaryClient.Type}/${type}`,
	});

export default {
	updateDictionary,
	searchPageList,
	createDictionary,
	deleteDictionary,
	getDictionaries,
	deleteBatch,
	getByType,
};
