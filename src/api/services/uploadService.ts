import apiClient from "../apiClient";

import type { Upload } from "#/entity";

export enum UploadApi {
	Single = "/upload/single",
}

const SingleUpload = () => apiClient.get<Upload[]>({ url: UploadApi.Single });

export default {
	SingleUpload,
};
