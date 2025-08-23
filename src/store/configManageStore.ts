import configService from "@/api/services/configService";
import type { Config, GroupConfig } from "@/types/entity";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { create } from "zustand";

interface ConfigManageState {
	data: Array<GroupConfig>;
}

const useConfigManageStore = create<ConfigManageState>()(() => ({
	data: [],
}));

// 更新
export const useUpdateOrCreateConfigMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: Config[]) => {
			await configService.updateConfig(data);
			return { ...data };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["configManageList"] });
		},
		onError: (err) => {
			console.error("Update or create API failed:", err);
		},
	});
};

export const useConfigQuery = () => {
	return useQuery({
		queryKey: ["configManageList"],
		queryFn: () => {
			return configService.getConfigs();
		},
	});
};

export const useConfigManage = () => useConfigManageStore((state) => state.data);
