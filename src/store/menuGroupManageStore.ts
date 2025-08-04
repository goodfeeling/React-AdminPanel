import menuGroupService from "@/api/services/menuGroupService";
import type { MenuGroup, PageList } from "@/types/entity";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { create } from "zustand";

interface MenuGroupManageState {
	data: PageList<MenuGroup>;
	loading: boolean;
	error: string | null;
}

const useMenuGroupManageStore = create<MenuGroupManageState>()(() => ({
	data: {
		list: [],
		total: 0,
		page: 1,
		page_size: 10,
		filters: undefined,
		total_page: 1,
	},
	loading: true,
	error: null,
}));

// 更新
export const useUpdateOrCreateMenuGroupMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: MenuGroup) => {
			if (data.id) {
				await menuGroupService.updateMenuGroup(data.id, data);
				return { ...data };
			}
			// 创建
			const response = await menuGroupService.createMenuGroup(data);
			return { ...data, id: response.id };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["apiManageList"] });
		},
		onError: (err) => {
			console.error("Update or create API failed:", err);
		},
	});
};

// 删除
export const useRemoveMenuGroupMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: number) => {
			await menuGroupService.deleteMenuGroup(id);
		},
		onSuccess: () => {
			// 成功后使相关查询失效，触发重新获取
			queryClient.invalidateQueries({ queryKey: ["apiManageList"] });
		},
		onError: (err) => {
			console.error("Delete API failed:", err);
		},
	});
};

export const useMenuGroupManage = () => useMenuGroupManageStore((state) => state.data);
export const useMenuGroupManageLoading = () => useMenuGroupManageStore((state) => state.loading);
export const useMenuGroupManageError = () => useMenuGroupManageStore((state) => state.error);
