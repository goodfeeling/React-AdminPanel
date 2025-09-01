import apiClient from "../apiClient";

import type { ConfigResponse } from "#/entity";

export enum ConfigClient {
	Config = "/config",
	ConfigModule = "/config/module",
}
const getConfigs = () => apiClient.get<ConfigResponse>({ url: `${ConfigClient.Config}` });
const updateConfig = (dataInfo: { [key: string]: string }, module: string) =>
	apiClient.put<{ [key: string]: string }>({
		url: `${ConfigClient.Config}/${module}`,
		data: dataInfo,
	});

const getConfigByModule = (module: string) =>
	apiClient.get<{ [key: string]: string }>({
		url: `${ConfigClient.ConfigModule}/${module}`,
	});
const getConfigBySite = () =>
	apiClient.get<{ [key: string]: string }>({
		url: `${ConfigClient.Config}/site`,
	});

export default {
	updateConfig,
	getConfigs,
	getConfigByModule,
	getConfigBySite,
};
