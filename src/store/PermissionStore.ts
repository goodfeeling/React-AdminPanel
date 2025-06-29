import type { NavProps } from "@/components/nav";
import { StorageEnum } from "@/types/enum";
import { useMutation } from "@tanstack/react-query";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
type MenuStore = {
	items: NavProps["data"];
	actions: {
		setItems: (items: NavProps["data"]) => void;
		clearItems: () => void;
	};
};

const useMenuStore = create<MenuStore>()(
	persist(
		(set) => ({
			items: [],
			actions: {
				setItems: (items) => {
					set({ items });
				},
				clearItems() {
					useMenuStore.persist.clearStorage();
				},
			},
		}),
		{
			name: "useNavStore",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({ [StorageEnum.Nav]: state.items }),
		},
	),
);

export const useMenuItems = () => useMenuStore((state) => state.items);
export const useMenuAction = () => useMenuStore((state) => state.actions);

export const useLoadMenuList = () => {
	const { setItems } = useMenuAction();
	const navMutation = useMutation({
		// mutationFn:
	});
};

export default useMenuStore;
