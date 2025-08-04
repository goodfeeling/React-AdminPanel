import apiClient from "../apiClient";

import type { FileInfo } from "#/entity";

export enum UploadApi {
	Single = "/upload/single",
}

const SingleUpload = () => apiClient.get<FileInfo[]>({ url: UploadApi.Single });

export default {
	SingleUpload,
};
