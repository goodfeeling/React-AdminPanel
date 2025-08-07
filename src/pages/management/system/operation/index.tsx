import { Icon } from "@/components/icon";
import useDictionaryByType from "@/hooks/dict";
import {
	useBatchRemoveOperationMutation,
	useOperationActions,
	useOperationManageCondition,
	useOperationQuery,
	useRemoveOperationMutation,
} from "@/store/operationManageStore";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { CardContent, CardHeader } from "@/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import type { TableProps } from "antd";
import { Card, Input, Popconfirm, Table } from "antd";
import type { TableRowSelection } from "antd/es/table/interface";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ColumnsType, Operation } from "#/entity";

type SearchFormFieldType = {
	method: string;
	path: string;
	status: number;
};

const searchDefaultValue = { path: "", method: "", status: 0 };

const App: React.FC = () => {
	const searchForm = useForm<SearchFormFieldType>({
		defaultValues: searchDefaultValue,
	});
	const removeMutation = useRemoveOperationMutation();
	const batchRemoveMutation = useBatchRemoveOperationMutation();
	const { data, isLoading } = useOperationQuery();
	const condition = useOperationManageCondition();
	const { setCondition } = useOperationActions();
	const apiMethod = useDictionaryByType("api_method");
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

	const handleTableChange: TableProps<Operation>["onChange"] = (pagination, filters, sorter) => {
		setCondition({
			...condition,
			pagination,
			filters,
			sortOrder: Array.isArray(sorter) ? undefined : condition.sortOrder,
			sortField: Array.isArray(sorter) ? undefined : condition.sortField,
		});
	};

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

	const columns: ColumnsType<Operation> = [
		{
			title: "ID",
			dataIndex: "id",
			key: "id",
		},
		{
			title: "IP 地址",
			dataIndex: "ip",
			key: "ip",
		},
		{
			title: "请求路径",
			dataIndex: "path",
			key: "path",
		},
		{
			title: "请求方法",
			dataIndex: "method",
			key: "method",
		},
		{
			title: "状态码",
			dataIndex: "status",
			key: "status",
		},
		{
			title: "延迟 (ms)",
			dataIndex: "latency",
			key: "latency",
		},
		{
			title: "用户代理",
			dataIndex: "agent",
			key: "agent",
		},
		{
			title: "错误信息",
			dataIndex: "error_message",
			key: "error_message",
		},
		{
			title: "请求体",
			dataIndex: "body",
			key: "body",
			ellipsis: true,
		},
		{
			title: "响应内容",
			dataIndex: "resp",
			key: "resp",
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

	const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
		setSelectedRowKeys(newSelectedRowKeys);
	};

	const rowSelection: TableRowSelection<Operation> = {
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

	const hasSelected = selectedRowKeys.length > 0;

	return (
		<div className="flex flex-col gap-4">
			<Card>
				<CardContent>
					<Form {...searchForm}>
						<div className="flex items-center gap-4">
							<FormField
								control={searchForm.control}
								name="method"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Method</FormLabel>
										<Select
											onValueChange={(value) => {
												field.onChange(value);
											}}
											value={field.value}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select Method" />
											</SelectTrigger>
											<SelectContent>
												{apiMethod.map((item) => {
													return (
														<SelectItem value={item.value} key={item.id}>
															<Badge variant="success">{item.label}</Badge>
														</SelectItem>
													);
												})}
											</SelectContent>
										</Select>
									</FormItem>
								)}
							/>
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
								name="status"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Status</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
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
			<Card title="Log List">
				<CardHeader>
					<div className="flex items-center justify-between">
						<Button variant="destructive" onClick={() => handleDeleteSelection()} disabled={!hasSelected}>
							<Icon icon="solar:trash-bin-minimalistic-outline" size={18} />
							Delete
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<Table<Operation>
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
			</Card>
		</div>
	);
};

export default App;
