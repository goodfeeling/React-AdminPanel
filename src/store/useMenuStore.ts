import menuService from "@/api/services/menuService";
import type { MenuTreeUserGroup } from "@/types/entity";
import { create } from "zustand";

// 定义 store 状态和方法
interface MenuState {
	menuData: MenuTreeUserGroup[]; // 菜单数据
	loading: boolean; // 加载状态
	error: string | null; // 错误信息
	fetchMenu: () => Promise<void>; // 获取菜单方法
}

export const useMenuStore = create<MenuState>((set) => ({
	menuData: [],
	loading: true,
	error: null,

	fetchMenu: async () => {
		set({ loading: true, error: null });
		try {
			const response = await menuService.getUserMenu();
			set({
				menuData: response.map((group) => ({
					name: group.name,
					items: group.items.map((item) => ({
						...item,
					})),
				})),
				loading: false,
			});
		} catch (err) {
			set({ error: (err as Error).message, loading: false });
		}
	},
}));
