import fileService from "@/api/services/fileService";
import type { FileInfo, PageList } from "@/types/entity";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { create } from "zustand";

interface FileInfoManageState {
	data: PageList<FileInfo>;
	loading: boolean;
	error: string | null;
}

const useFileInfoManageStore = create<FileInfoManageState>()(() => ({
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
export const useUpdateOrCreateFileInfoMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: FileInfo) => {
			if (data.id) {
				await fileService.updateFileInfo(data.id, data);
				return { ...data };
			}
			// 创建
			const response = await fileService.createFileInfo(data);
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
export const useRemoveFileInfoMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: number) => {
			await fileService.deleteFileInfo(id);
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
// 批量删除
export const useBatchRemoveFileInfoMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (selectedRowKeys: number[]) => {
			await fileService.deleteBatch(selectedRowKeys);
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

export const useFileInfoManage = () => useFileInfoManageStore((state) => state.data);
export const useFileInfoManageLoading = () => useFileInfoManageStore((state) => state.loading);
export const useFileInfoManageError = () => useFileInfoManageStore((state) => state.error);
