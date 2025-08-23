import configService from "@/api/services/configService";
import { StorageEnum } from "@/types/enum";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// 定义 store 状态和方法
interface ConfigSystemState {
	config: Map<string, string>;
	loading: boolean;
	error: string | null;
	actions: {
		fetchConfig: () => Promise<void>;
	};
}

const useeSystemConfigStore = create<ConfigSystemState>()(
	persist(
		(set) => ({
			config: new Map(),
			loading: true,
			error: null,

			actions: {
				fetchConfig: async () => {
					set({ loading: true, error: null });
					try {
						const response = await configService.getConfigBySystem();
						const configMap = new Map<string, string>();
						for (const config of response) {
							configMap.set(config.config_key, config.config_value);
						}
						set({
							config: configMap,
							loading: false,
						});
					} catch (err) {
						set({ error: (err as Error).message, loading: false });
					}
				},
			},
		}),
		{
			name: StorageEnum.SysConfig,
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({ [StorageEnum.SysConfig]: state.config }),
		},
	),
);

export const useSystemConfigActions = () => useeSystemConfigStore((state) => state.actions);
export const useSystemConfig = () => useeSystemConfigStore((state) => state.config);

export const useeSystemConfigLoading = () => useeSystemConfigStore((state) => state.loading);
export const useeSystemConfigError = () => useeSystemConfigStore((state) => state.error);
