import apiClient from "../apiClient";

import type { DictionaryDetail, PageList } from "#/entity";

export enum DictionaryDetailClient {
  DictionaryDetail = "/api",
  SearchDictionaryDetail = "/api/search",
  GroupsDictionaryDetail = "/api/groups",
  DeleteBatch = "/api/batch",
}
const getDictionaryDetails = () =>
  apiClient.get<DictionaryDetail[]>({
    url: `${DictionaryDetailClient.DictionaryDetail}`,
  });
const updateDictionaryDetail = (id: number, apiInfo: DictionaryDetail) =>
  apiClient.put<DictionaryDetail>({
    url: `${DictionaryDetailClient.DictionaryDetail}/${id}`,
    data: apiInfo,
  });

const createDictionaryDetail = (apiInfo: DictionaryDetail) =>
  apiClient.post<DictionaryDetail>({
    url: `${DictionaryDetailClient.DictionaryDetail}`,
    data: apiInfo,
  });

const searchPageList = (searchStr: string) =>
  apiClient.get<PageList<DictionaryDetail>>({
    url: `${DictionaryDetailClient.SearchDictionaryDetail}?${searchStr}`,
  });

const deleteDictionaryDetail = (id: number) =>
  apiClient.delete<string>({
    url: `${DictionaryDetailClient.DictionaryDetail}/${id}`,
  });

const deleteBatch = (ids: number[]) =>
  apiClient.post<number>({
    url: `${DictionaryDetailClient.DeleteBatch}`,
    data: { ids },
  });

export default {
  updateDictionaryDetail,
  searchPageList,
  createDictionaryDetail,
  deleteDictionaryDetail,
  getDictionaryDetails,
  deleteBatch,
};
