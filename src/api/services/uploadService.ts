import apiClient from "../apiClient";

import type { FileInfo, STSToken } from "#/entity";

export enum UploadApi {
	Single = "/upload/single",
	Multiple = "/upload/multiple",
	AliYUnSTSToken = "/upload/sts-token",
	RefreshSTSToken = "/upload/refresh-sts",
}

const SingleUpload = () => apiClient.get<FileInfo[]>({ url: UploadApi.Single });

const MultipleUpload = () => apiClient.get<FileInfo[]>({ url: UploadApi.Multiple });

const GetSTSToken = () => apiClient.get<STSToken>({ url: UploadApi.AliYUnSTSToken });

const RefreshSTSToken = (refreshToken: string) =>
	apiClient.get<STSToken>({
		url: `${UploadApi.RefreshSTSToken}?refresh_token=${refreshToken}`,
	});

export default {
	SingleUpload,
	MultipleUpload,
	GetSTSToken,
	RefreshSTSToken,
};
