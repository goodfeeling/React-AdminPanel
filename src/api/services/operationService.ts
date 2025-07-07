import apiClient from "../apiClient";

import type { Operation, PageList } from "#/entity";

export enum OperationApi {
  Operation = "/operation",
  OperationDeleteBatch = "/operation/deleteBatch",
  OperationSearch = "/operation/search",
}

const searchPageList = (searchStr: string) =>
  apiClient.get<PageList<Operation>>({
    url: `${OperationApi.OperationSearch}?${searchStr}`,
  });
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
};
