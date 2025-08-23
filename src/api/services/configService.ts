import apiClient from "../apiClient";

import type { Config, GroupConfig } from "#/entity";

export enum ConfigClient {
	Config = "/config",
	ConfigModule = "/config/module",
}
const getConfigs = () => apiClient.get<GroupConfig[]>({ url: `${ConfigClient.Config}` });
const updateConfig = (dataInfo: Config[], module: string) =>
	apiClient.put<Config>({
		url: `${ConfigClient.Config}/${module}`,
		data: dataInfo,
	});

const getConfigByModule = (module: string) =>
	apiClient.get<Config[]>({ url: `${ConfigClient.ConfigModule}/${module}` });
const getConfigBySystem = () => apiClient.get<Config[]>({ url: `${ConfigClient.Config}/system` });

export default {
	updateConfig,
	getConfigs,
	getConfigByModule,
	getConfigBySystem,
};
