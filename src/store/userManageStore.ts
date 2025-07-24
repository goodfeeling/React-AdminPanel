import userService from "@/api/services/userService";
import type { PageList, UserInfo } from "@/types/entity";
import { create } from "zustand";

interface UserManageState {
	data: PageList<UserInfo>;
	loading: boolean;
	error: string | null;
	actions: {
		fetch: (searchStr: string) => Promise<void>;
		updateOrCreate: (data: UserInfo) => Promise<UserInfo | null>;
		remove: (id: number) => Promise<void>;
		resetPassword: (id: number) => Promise<void>;
	};
}

const useUserManageStore = create<UserManageState>()((set) => ({
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

	actions: {
		fetch: async (searchStr: string) => {
			set({ loading: true, error: null });
			try {
				const response = await userService.searchPageList(searchStr);
				set({
					data: response,
					loading: false,
				});
			} catch (err) {
				set({ error: (err as Error).message, loading: false });
			}
		},
		updateOrCreate: async (value: UserInfo): Promise<UserInfo | null> => {
			set({ loading: true, error: null });
			try {
				let newData: UserInfo;
				if (value.id) {
					// 更新操作
					await userService.updateUser(value.id, value);
					newData = { ...value }; // 保持原有的数据，包括 id
				} else {
					// 创建操作
					const response = await userService.createUser(value);
					newData = { ...value, id: response.id }; // 将生成的 id 添加到 newData 中
				}
				return newData;
			} catch (err) {
				console.error(err);
				set({ error: (err as Error).message, loading: false });
				return null;
			}
		},
		remove: async (id: number) => {
			try {
				await userService.deleteUser(id);
			} catch (err) {
				console.error(err);
			}
		},
		resetPassword: async (id: number) => {
			try {
				await userService.resetPassword(id);
			} catch (err) {
				console.error(err);
			}
		},
	},
}));

export const useUserManageActions = () => useUserManageStore((state) => state.actions);
export const useUserManage = () => useUserManageStore((state) => state.data);
export const useUserManageLoading = () => useUserManageStore((state) => state.loading);
export const useUserManageError = () => useUserManageStore((state) => state.error);
