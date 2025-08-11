import scheduleService from "@/api/services/taskExecutionLogService";
import type { PageList, TableParams, TaskExecutionLog } from "@/types/entity";
import { getRandomUserParams, toURLSearchParams } from "@/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { create } from "zustand";

interface TaskExecutionLogManageState {
	data: PageList<TaskExecutionLog>;
	condition: TableParams;
	actions: {
		setCondition: (tableParams: TableParams) => void;
	};
}

const useTaskExecutionLogManageStore = create<TaskExecutionLogManageState>()((set) => ({
	data: {
		list: [],
		total: 0,
		page: 1,
		page_size: 10,
		filters: undefined,
		total_page: 1,
	},
	condition: {
		pagination: {
			current: 1,
			pageSize: 10,
			total: 0,
		},
		sortField: "id",
		sortOrder: "descend",
	},
	actions: {
		setCondition: (condition: TableParams) => {
			set({ condition });
		},
	},
}));

// 删除
export const useRemoveTaskExecutionLogMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: number) => {
			await scheduleService.deleteTaskExecutionLog(id);
		},
		onSuccess: () => {
			// 成功后使相关查询失效，触发重新获取
			queryClient.invalidateQueries({ queryKey: ["scheduleManageList"] });
		},
		onError: (err) => {
			console.error("Delete API failed:", err);
		},
	});
};
// 批量删除
export const useBatchRemoveTaskExecutionLogMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (selectedRowKeys: number[]) => {
			await scheduleService.deleteBatch(selectedRowKeys);
		},
		onSuccess: () => {
			// 成功后使相关查询失效，触发重新获取
			queryClient.invalidateQueries({ queryKey: ["scheduleManageList"] });
		},
		onError: (err) => {
			console.error("Delete API failed:", err);
		},
	});
};

export const useTaskExecutionLogQuery = () => {
	const tableParams = useTaskExecutionLogManageStore.getState().condition;
	return useQuery({
		queryKey: [
			"scheduleManageList",
			tableParams.pagination?.current,
			tableParams.pagination?.pageSize,
			tableParams.sortField,
			tableParams.sortOrder,
			tableParams.searchParams,
			tableParams.filters,
		],
		queryFn: () => {
			const params = toURLSearchParams(
				getRandomUserParams(tableParams, (result, searchParams) => {
					if (searchParams) {
						if (searchParams.path) {
							result.path_like = searchParams.path;
						}
						if (searchParams.description) {
							result.description_like = searchParams.description;
						}

						if (searchParams.method) {
							result.method_match = searchParams.method;
						}
						if (searchParams.api_group) {
							result.apiGroup_match = searchParams.api_group;
						}
					}
				}),
			);
			return scheduleService.searchPageList(params.toString());
		},
	});
};

export const useTaskExecutionLogManage = () => useTaskExecutionLogManageStore((state) => state.data);

export const useTaskExecutionLogManageCondition = () => useTaskExecutionLogManageStore((state) => state.condition);
export const useTaskExecutionLogManegeActions = () => useTaskExecutionLogManageStore((state) => state.actions);
