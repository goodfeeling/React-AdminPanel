import { Icon } from "@/components/icon";

import useDictionaryByType from "@/hooks/dict";
import {
	useBatchRemoveScheduledTaskMutation,
	useDisableTaskMutation,
	useEnableTaskMutation,
	useReloadTaskMutation,
	useRemoveScheduledTaskMutation,
	useScheduledTaskManageCondition,
	useScheduledTaskManegeActions,
	useScheduledTaskQuery,
	useUpdateOrCreateScheduledTaskMutation,
} from "@/store/scheduleManageStore";
import { Button } from "@/ui/button";
import { CardContent, CardHeader } from "@/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/ui/form";

import { Badge } from "@/ui/badge";
import type { TableProps } from "antd";
import { Card, Input, Popconfirm, Select, Table } from "antd";
import type { TableRowSelection } from "antd/es/table/interface";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ColumnsType, ScheduledTask } from "#/entity";
import ScheduledTaskModal, { type ScheduledTaskModalProps } from "./modal";

const defaultScheduledTaskValue: ScheduledTask = {
	id: 0,
	task_name: "",
	task_description: "",
	cron_expression: "",
	task_type: "",
	task_params: {},
	status: 1,
	exec_type: "",
	last_execute_time: "",
	next_execute_time: "",
	created_at: "",
	updated_at: "",
};

type SearchFormFieldType = {
	task_name?: string;
	status?: string;
	task_type?: string;
};

const searchDefaultValue = {
	task_name: undefined,
	status: undefined,
	task_type: undefined,
};

const App: React.FC = () => {
	const searchForm = useForm<SearchFormFieldType>({
		defaultValues: searchDefaultValue,
	});

	const updateOrCreateMutation = useUpdateOrCreateScheduledTaskMutation();
	const removeMutation = useRemoveScheduledTaskMutation();
	const batchRemoveMutation = useBatchRemoveScheduledTaskMutation();
	const enableTaskMutation = useEnableTaskMutation();
	const disableTaskMutation = useDisableTaskMutation();
	const reloadTaskMutation = useReloadTaskMutation();

	// load data
	const { data, isLoading } = useScheduledTaskQuery({ enablePolling: true });
	const condition = useScheduledTaskManageCondition();
	const { setCondition } = useScheduledTaskManegeActions();

	// enum type
	const taskTypes = useDictionaryByType("task_type");
	const statusType = useDictionaryByType("task_status");
	const statusTypeMap = new Map<string, string>(statusType.map((item) => [item.value, item.label]));

	const [processingTaskIds, setProcessingTaskIds] = useState<Set<number>>(new Set());
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [apiModalProps, setScheduledTaskModalProps] = useState<ScheduledTaskModalProps>({
		formValue: { ...defaultScheduledTaskValue },
		title: "New",
		show: false,
		onOk: async (values: ScheduledTask) => {
			updateOrCreateMutation.mutate(values, {
				onSuccess: () => {
					toast.success("success!");
					setScheduledTaskModalProps((prev) => ({ ...prev, show: false }));
				},
			});
			return true;
		},
		onCancel: () => {
			setScheduledTaskModalProps((prev) => ({ ...prev, show: false }));
		},
	});

	const handleTableChange: TableProps<ScheduledTask>["onChange"] = (pagination, filters, sorter) => {
		setCondition({
			...condition,
			pagination,
			filters,
			sortOrder: Array.isArray(sorter) ? undefined : condition.sortOrder,
			sortField: Array.isArray(sorter) ? undefined : condition.sortField,
		});
	};

	const onCreate = () => {
		setScheduledTaskModalProps((prev) => ({
			...prev,
			show: true,
			...defaultScheduledTaskValue,
			title: "New",
			formValue: { ...defaultScheduledTaskValue },
		}));
	};

	const onEdit = (formValue: ScheduledTask) => {
		setScheduledTaskModalProps((prev) => ({
			...prev,
			show: true,
			title: "Edit",
			formValue,
		}));
	};

	// single delete
	const handleDelete = async (id: number) => {
		removeMutation.mutate(id, {
			onSuccess: () => {
				toast.success("删除成功");
			},
			onError: () => {
				toast.error("删除失败");
			},
		});
	};

	// batch delete
	const handleDeleteSelection = async () => {
		batchRemoveMutation.mutate(selectedRowKeys as number[], {
			onSuccess: () => {
				toast.success("删除成功");
			},
			onError: () => {
				toast.error("删除失败");
			},
		});
	};

	const columns: ColumnsType<ScheduledTask> = [
		{
			title: "ID",
			dataIndex: "id",
			key: "id",
		},
		{
			title: "task_name",
			dataIndex: "task_name",
			key: "task_name",
			ellipsis: true,
		},
		{
			title: "cron_expression",
			dataIndex: "cron_expression",
			key: "cron_expression",
		},
		{
			title: "task_type",
			dataIndex: "task_type",
			key: "task_type",
			render: (task_type) => {
				const taskType = taskTypes.find((item) => item.value === task_type);
				return taskType?.label || task_type;
			},
		},
		{
			title: "status",
			dataIndex: "status",
			key: "status",
			render: (status: number) => {
				const statusResult = statusTypeMap.get(status.toString())?.toLowerCase();
				return <Badge variant={(statusResult as any) ?? "default"}>{statusResult}</Badge>;
			},
		},

		{
			title: "last_execute_time",
			dataIndex: "last_execute_time",
			key: "last_execute_time",
		},
		{
			title: "next_execute_time",
			dataIndex: "next_execute_time",
			key: "next_execute_time",
		},
		{
			title: "createdTime",
			dataIndex: "created_at",
			key: "created_at",
		},
		{
			title: "updateTime",
			dataIndex: "updated_at",
			key: "updated_at",
		},
		{
			title: "操作",
			key: "operation",
			align: "center",
			fixed: "right",
			width: 100,
			render: (_, record) => (
				<div className="flex w-full justify-center text-gray-500">
					<Button
						variant="link"
						size="icon"
						onClick={() => onEnableTask(record)}
						style={{ minWidth: "70px" }}
						disabled={record.status === 0 || record.status === 2 || processingTaskIds.has(record.id)}
						className="flex flex-row  items-center justify-center gap-1 px-2 py-1"
					>
						{processingTaskIds.has(record.id) && record.status !== 2 ? (
							<>
								<Icon icon="svg-spinners:bars-rotate-fade" size={18} />
								<span className="text-xs">处理中</span>
							</>
						) : (
							<>
								<Icon icon="solar:rewind-back-line-duotone" size={18} />
								<span className="text-xs">启动</span>
							</>
						)}
					</Button>
					<Button
						variant="link"
						size="icon"
						onClick={() => onDisableTask(record)}
						disabled={record.status === 1 || processingTaskIds.has(record.id)}
						style={{ minWidth: "50px" }}
						className="flex flex-row  items-center justify-center gap-1 px-2 py-1"
					>
						{processingTaskIds.has(record.id) && record.status !== 1 ? (
							<>
								<Icon icon="svg-spinners:bars-rotate-fade" size={18} />
								<span className="text-xs">处理中</span>
							</>
						) : (
							<>
								<Icon icon="solar:stop-circle-outline" size={18} />
								<span className="text-xs">关闭</span>
							</>
						)}
					</Button>
					<Button
						variant="link"
						size="icon"
						onClick={() => onEdit(record)}
						style={{ minWidth: "50px" }}
						className="flex flex-row  items-center justify-center gap-1 px-2 py-1"
					>
						<Icon icon="solar:pen-bold-duotone" size={18} />
						<span className="text-xs">修改</span>
					</Button>
					<Button
						variant="link"
						size="icon"
						onClick={() => onEdit(record)}
						style={{ minWidth: "70px" }}
						className="flex flex-row  items-center justify-center gap-1 px-2 py-1"
					>
						<Icon icon="solar:menu-dots-circle-linear" size={18} />
						<span className="text-xs">日志</span>
					</Button>
					<Popconfirm
						title="Delete the task"
						description="Are you sure to delete this task?"
						onConfirm={() => handleDelete(record.id)}
						okText="Yes"
						cancelText="No"
					>
						<Button variant="link" size="icon">
							<Icon icon="mingcute:delete-2-fill" size={18} />
							<span className="text-xs">删除</span>
						</Button>
					</Popconfirm>
				</div>
			),
		},
	];

	const onReset = () => {
		setCondition({
			...condition,
			searchParams: searchDefaultValue,
			pagination: {
				...condition.pagination,
				current: 1,
			},
		});
		searchForm.reset();
	};

	const onSearch = () => {
		const values = searchForm.getValues();
		setCondition({
			...condition,
			searchParams: {
				...values,
			},
			pagination: {
				...condition.pagination,
				current: 1,
			},
		});
	};

	// running task
	const onEnableTask = async (formValue: ScheduledTask) => {
		setProcessingTaskIds((prev) => new Set(prev).add(formValue.id));
		enableTaskMutation.mutate(formValue.id, {
			onSuccess: () => {
				toast.success("启动成功");
				setProcessingTaskIds((prev) => {
					const newSet = new Set(prev);
					newSet.delete(formValue.id);
					return newSet;
				});
			},
			onError: () => {
				toast.error("启动失败");
				setProcessingTaskIds((prev) => {
					const newSet = new Set(prev);
					newSet.delete(formValue.id);
					return newSet;
				});
			},
		});
	};

	// stop task
	const onDisableTask = (formValue: ScheduledTask) => {
		// 添加任务到处理中集合
		setProcessingTaskIds((prev) => new Set(prev).add(formValue.id));

		disableTaskMutation.mutate(formValue.id, {
			onSuccess: () => {
				toast.success("关闭成功");
				// 从处理中集合移除任务
				setProcessingTaskIds((prev) => {
					const newSet = new Set(prev);
					newSet.delete(formValue.id);
					return newSet;
				});
			},
			onError: () => {
				toast.error("关闭失败");
				// 从处理中集合移除任务
				setProcessingTaskIds((prev) => {
					const newSet = new Set(prev);
					newSet.delete(formValue.id);
					return newSet;
				});
			},
		});
	};

	// reload task
	const onReloadTask = () => {
		reloadTaskMutation.mutate(undefined, {
			onSuccess: () => {
				toast.success("启动成功");
			},
			onError: () => {
				toast.error("启动失败");
			},
		});
	};

	// 选择改变
	const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
		console.log("selectedRowKeys changed: ", newSelectedRowKeys);
		setSelectedRowKeys(newSelectedRowKeys);
	};

	const rowSelection: TableRowSelection<ScheduledTask> = {
		selectedRowKeys,
		onChange: onSelectChange,
		selections: [
			Table.SELECTION_ALL,
			Table.SELECTION_INVERT,
			Table.SELECTION_NONE,
			{
				key: "odd",
				text: "Select Odd Row",
				onSelect: (changeableRowKeys) => {
					let newSelectedRowKeys = [];
					newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
						if (index % 2 !== 0) {
							return false;
						}
						return true;
					});
					setSelectedRowKeys(newSelectedRowKeys);
				},
			},
			{
				key: "even",
				text: "Select Even Row",
				onSelect: (changeableRowKeys) => {
					let newSelectedRowKeys = [];
					newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
						if (index % 2 !== 0) {
							return true;
						}
						return false;
					});
					setSelectedRowKeys(newSelectedRowKeys);
				},
			},
		],
	};

	return (
		<div className="flex flex-col gap-4">
			<Card>
				<CardContent>
					<Form {...searchForm}>
						<div className="flex items-center gap-4">
							<FormField
								control={searchForm.control}
								name="task_name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>TaskName</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={searchForm.control}
								name="task_type"
								render={({ field }) => (
									<FormItem>
										<FormLabel>TaskType</FormLabel>
										<Select
											onChange={(value: string) => {
												field.onChange(value);
											}}
											value={field.value}
											options={taskTypes}
											placeholder="select task type"
										/>
									</FormItem>
								)}
							/>

							<FormField
								control={searchForm.control}
								name="status"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Status</FormLabel>
										<Select
											onChange={(value: string) => {
												field.onChange(value);
											}}
											value={field.value}
											options={statusType}
											placeholder="Select status"
										/>
									</FormItem>
								)}
							/>

							<div className="flex ml-auto">
								<Button variant="outline" onClick={() => onReset()}>
									<Icon icon="solar:restart-line-duotone" size={18} />
									Reset
								</Button>
								<Button variant="default" className="ml-4" onClick={() => onSearch()}>
									<Icon icon="solar:rounded-magnifer-linear" size={18} />
									Search
								</Button>
							</div>
						</div>
					</Form>
				</CardContent>
			</Card>
			<Card title="ScheduledTask List">
				<CardHeader>
					<div className="flex items-start justify-start">
						<Button onClick={() => onCreate()} variant="default">
							<Icon icon="solar:add-circle-outline" size={18} />
							New
						</Button>
						<Button
							onClick={() => handleDeleteSelection()}
							variant="ghost"
							className="ml-2"
							disabled={!(selectedRowKeys.length > 0)}
						>
							<Icon icon="solar:trash-bin-minimalistic-outline" size={18} />
							Delete
						</Button>
						<Button onClick={() => onReloadTask()} variant="default">
							<Icon icon="solar:refresh-bold" size={18} />
							ReloadAllTask
						</Button>
					</div>
				</CardHeader>

				<CardContent>
					<Table<ScheduledTask>
						rowKey={(record) => record.id}
						rowSelection={rowSelection}
						scroll={{ x: "max-content" }}
						columns={columns}
						pagination={{
							current: data?.page || 1,
							pageSize: data?.page_size || 10,
							total: data?.total || 0,
							showTotal: (total) => `共 ${total} 条`,
							showSizeChanger: true,
							pageSizeOptions: ["10", "20", "50", "100"],
						}}
						dataSource={data?.list}
						loading={isLoading}
						onChange={handleTableChange}
						onRow={(record) => ({
							className: processingTaskIds.has(record.id) ? "opacity-75" : "",
						})}
					/>
				</CardContent>
				<ScheduledTaskModal {...apiModalProps} />
			</Card>
		</div>
	);
};

export default App;
