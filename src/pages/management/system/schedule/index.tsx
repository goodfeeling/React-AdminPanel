import { Icon } from "@/components/icon";

import useDictionaryByType from "@/hooks/dict";
import {
	useBatchRemoveScheduledTaskMutation,
	useRemoveScheduledTaskMutation,
	useScheduledTaskManageCondition,
	useScheduledTaskManegeActions,
	useScheduledTaskQuery,
	useUpdateOrCreateScheduledTaskMutation,
} from "@/store/scheduleManageStore";
import { Button } from "@/ui/button";
import { CardContent, CardHeader } from "@/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/ui/form";

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
	status: 0,
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
	task_name: "",
	status: "",
	task_type: "",
};

const App: React.FC = () => {
	const searchForm = useForm<SearchFormFieldType>({
		defaultValues: searchDefaultValue,
	});

	const updateOrCreateMutation = useUpdateOrCreateScheduledTaskMutation();
	const removeMutation = useRemoveScheduledTaskMutation();
	const batchRemoveMutation = useBatchRemoveScheduledTaskMutation();
	const { data, isLoading } = useScheduledTaskQuery();
	const condition = useScheduledTaskManageCondition();
	const { setCondition } = useScheduledTaskManegeActions();
	const taskTypes = useDictionaryByType("task_type");
	const statusType = useDictionaryByType("status");
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
			title: "路径",
			dataIndex: "path",
			key: "path",
			ellipsis: true,
		},
		{
			title: "所属组",
			dataIndex: "api_group",
			key: "api_group",
		},
		{
			title: "请求方法",
			dataIndex: "method",
			key: "method",
		},
		{
			title: "描述",
			dataIndex: "description",
			key: "description",
			ellipsis: true,
		},
		{
			title: "创建时间",
			dataIndex: "created_at",
			key: "created_at",
		},
		{
			title: "更新时间",
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
						onClick={() => onEdit(record)}
						style={{ minWidth: "70px" }}
						className="flex flex-row  items-center justify-center gap-1 px-2 py-1"
					>
						<Icon icon="solar:pen-bold-duotone" size={18} />
						<span className="text-xs">修改</span>
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
											style={{ width: 150 }}
											onChange={(value: string) => {
												field.onChange(value);
											}}
											value={field.value}
											options={taskTypes}
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
											style={{ width: 120 }}
											onChange={(value: string) => {
												field.onChange(value);
											}}
											value={field.value}
											options={statusType}
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
					/>
				</CardContent>
				<ScheduledTaskModal {...apiModalProps} />
			</Card>
		</div>
	);
};

export default App;
