import apiClient from "../apiClient";

import type { Config, GroupConfig } from "#/entity";

export enum ConfigClient {
	Config = "/config",
	ConfigModule = "/config/module",
}
const getConfigs = () => apiClient.get<GroupConfig[]>({ url: `${ConfigClient.Config}` });
const updateConfig = (dataInfo: Config[]) =>
	apiClient.put<Config>({
		url: `${ConfigClient.Config}`,
		data: dataInfo,
	});

const getConfigByModule = (module: string) =>
	apiClient.get<Config[]>({ url: `${ConfigClient.ConfigModule}/${module}` });

export default {
	updateConfig,
	getConfigs,
	getConfigByModule,
};
