import { Icon } from "@/components/icon";
import useDictionaryByType from "@/hooks/dict";
import {
	useApiActions,
	useApiManageCondition,
	useApiQuery,
	useBatchRemoveApiMutation,
	useRemoveApiMutation,
	useSynchronizeApiMutation,
	useUpdateOrCreateApiMutation,
} from "@/store/apiManageStore";
import { Button } from "@/ui/button";
import { CardContent, CardHeader } from "@/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/ui/form";

import type { TableProps } from "antd";
import { Card, Input, Popconfirm, Select, Table } from "antd";
import type { TableRowSelection } from "antd/es/table/interface";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { Api, ColumnsType } from "#/entity";
import ApiModal, { type ApiModalProps } from "./api-modal";

const defaultApiValue: Api = {
	id: 0,
	path: "",
	api_group: "",
	method: "",
	description: "",
	created_at: "",
	updated_at: "",
};

type SearchFormFieldType = {
	path?: string;
	description?: string;
	api_group?: string;
	method?: string;
};

const searchDefaultValue = {
	path: "",
	description: "",
	api_group: undefined,
	method: undefined,
};

const App: React.FC = () => {
	const searchForm = useForm<SearchFormFieldType>({
		defaultValues: searchDefaultValue,
	});

	const updateOrCreateMutation = useUpdateOrCreateApiMutation();
	const removeMutation = useRemoveApiMutation();
	const batchRemoveMutation = useBatchRemoveApiMutation();
	const synchronizeMutation = useSynchronizeApiMutation();
	const { data, isLoading } = useApiQuery();
	const condition = useApiManageCondition();
	const { setCondition } = useApiActions();
	const apiGroup = useDictionaryByType("api_group");
	const apiMethod = useDictionaryByType("api_method");

	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [apiModalProps, setApiModalProps] = useState<ApiModalProps>({
		formValue: { ...defaultApiValue },
		apiGroup: undefined,
		apiMethod: undefined,
		title: "New",
		show: false,
		onOk: async (values: Api) => {
			updateOrCreateMutation.mutate(values, {
				onSuccess: () => {
					toast.success("success!");
					setApiModalProps((prev) => ({ ...prev, show: false }));
				},
			});
		},
		onCancel: () => {
			setApiModalProps((prev) => ({ ...prev, show: false }));
		},
	});

	useEffect(() => {
		setApiModalProps((prev) => ({
			...prev,
			apiGroup: apiGroup,
			apiMethod: apiMethod,
		}));
	}, [apiGroup, apiMethod]);

	const handleTableChange: TableProps<Api>["onChange"] = (pagination, filters, sorter) => {
		setCondition({
			...condition,
			pagination,
			filters,
			sortOrder: Array.isArray(sorter) ? undefined : condition.sortOrder,
			sortField: Array.isArray(sorter) ? undefined : condition.sortField,
		});
	};

	const onCreate = () => {
		setApiModalProps((prev) => ({
			...prev,
			show: true,
			...defaultApiValue,
			title: "New",
			formValue: { ...defaultApiValue },
		}));
	};

	const onEdit = (formValue: Api) => {
		setApiModalProps((prev) => ({
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

	const columns: ColumnsType<Api> = [
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

	// 同步数据
	const onSynchronize = () => {
		synchronizeMutation.mutate();
	};

	// 选择改变
	const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
		console.log("selectedRowKeys changed: ", newSelectedRowKeys);
		setSelectedRowKeys(newSelectedRowKeys);
	};

	const rowSelection: TableRowSelection<Api> = {
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
								name="path"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Path</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={searchForm.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={searchForm.control}
								name="method"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Method</FormLabel>
										<Select
											onChange={(value: string) => {
												field.onChange(value);
											}}
											value={field.value}
											options={apiMethod}
											placeholder="Select method"
										/>
									</FormItem>
								)}
							/>
							<FormField
								control={searchForm.control}
								name="api_group"
								render={({ field }) => (
									<FormItem>
										<FormLabel>ApiGroup</FormLabel>
										<Select
											onChange={(value: string) => {
												field.onChange(value);
											}}
											value={field.value}
											options={apiGroup}
											placeholder="Select ApiGroup"
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
			<Card title="Api List">
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
						<Button onClick={() => onSynchronize()} variant="outline" className="ml-2">
							<Icon icon="solar:refresh-outline" size={18} />
							Synchronize
						</Button>
						{/* <Button onClick={() => onCreate()} className="ml-2" variant="default">
							<Icon icon="solar:cloud-download-outline" size={18} />
							Download Template
						</Button>
						<Button onClick={() => onCreate()} className="ml-2" variant="default">
							<Icon icon="solar:import-outline" size={18} />
							import
						</Button>
						<Button onClick={() => onCreate()} className="ml-2" variant="default">
							<Icon icon="solar:export-outline" size={18} />
							export
						</Button> */}
					</div>
				</CardHeader>

				<CardContent>
					<Table<Api>
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
				<ApiModal {...apiModalProps} />
			</Card>
		</div>
	);
};

export default App;
