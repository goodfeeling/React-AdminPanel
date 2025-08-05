import { Icon } from "@/components/icon";
import {
	useBatchRemoveFileInfoMutation,
	useFileInfoActions,
	useFileInfoManageCondition,
	useFileInfoQuery,
	useRemoveFileInfoMutation,
	useUpdateOrCreateFileInfoMutation,
} from "@/store/fileManageStore";
import { Button } from "@/ui/button";
import { CardContent, CardHeader } from "@/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

import useDictionaryByType from "@/hooks/dict";
import { Badge } from "@/ui/badge";
import type { TableProps } from "antd";
import { Card, Input, Popconfirm, Table } from "antd";
import type { TableRowSelection } from "antd/es/table/interface";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ColumnsType, FileInfo } from "#/entity";
import FileModal, { type FileModalProps } from "./modal";

const defaultFileValue: FileInfo = {
	id: 0,
	file_name: "",
	file_md5: "",
	file_path: "",
	file_url: "",
	file_origin_name: "",
	storage_engine: "",
	created_at: "",
	updated_at: "",
};

type SearchFormFieldType = {
	file_origin_name?: string;
	storage_engine?: string;
};

const searchDefaultValue = {
	file_origin_name: "",
	storage_engine: "",
};

const App: React.FC = () => {
	const searchForm = useForm<SearchFormFieldType>({
		defaultValues: searchDefaultValue,
	});

	const updateOrCreateMutation = useUpdateOrCreateFileInfoMutation();
	const removeMutation = useRemoveFileInfoMutation();
	const batchRemoveMutation = useBatchRemoveFileInfoMutation();
	const { data, isLoading } = useFileInfoQuery();
	const condition = useFileInfoManageCondition();
	const { setCondition } = useFileInfoActions();

	const storageEngine = useDictionaryByType("storage_engine");

	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [apiModalProps, setFileModalProps] = useState<FileModalProps>({
		formValue: { ...defaultFileValue },
		title: "上传文件",
		storageEngine: undefined,
		show: false,
		onOk: async (values: FileInfo) => {
			updateOrCreateMutation.mutate(values, {
				onSuccess: () => {
					toast.success("success!");
					setFileModalProps((prev) => ({ ...prev, show: false }));
				},
			});
			return true;
		},
		onCancel: () => {
			setFileModalProps((prev) => ({ ...prev, show: false }));
		},
	});

	useEffect(() => {
		setFileModalProps((prev) => ({ ...prev, storageEngine }));
	}, [storageEngine]);

	const handleTableChange: TableProps<FileInfo>["onChange"] = (pagination, filters, sorter) => {
		setCondition({
			pagination,
			filters,
			sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
			sortField: Array.isArray(sorter) ? undefined : sorter.field,
		});
	};

	const onCreate = () => {
		setFileModalProps((prev) => ({
			...prev,
			show: true,
			...defaultFileValue,
			title: "上传文件",
			formValue: { ...defaultFileValue },
		}));
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

	const columns: ColumnsType<FileInfo> = [
		{
			title: "ID",
			dataIndex: "id",
			key: "id",
		},
		{
			title: "文件名",
			dataIndex: "file_origin_name",
			key: "file_origin_name",
			ellipsis: true,
		},
		{
			title: "文件链接",
			dataIndex: "file_url",
			key: "file_url",
			render: (_, record) => {
				return (
					<div className="flex">
						<img alt="" src={record.file_url} className="h-20 w-20" />
					</div>
				);
			},
		},
		{
			title: "存储方式",
			dataIndex: "storage_engine",
			key: "storage_engine",
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
						<Button
							variant="ghost"
							size="icon"
							className="flex flex-row  items-center justify-center gap-1 px-2 py-1 text-error"
						>
							<Icon icon="mingcute:delete-2-fill" size={18} className="text-error!" />
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
		console.log("selectedRowKeys changed: ", newSelectedRowKeys);
		setSelectedRowKeys(newSelectedRowKeys);
	};

	const rowSelection: TableRowSelection<FileInfo> = {
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
								name="file_origin_name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>fileOriginName</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={searchForm.control}
								name="storage_engine"
								render={({ field }) => (
									<FormItem>
										<FormLabel>storageEngine</FormLabel>
										<FormControl>
											<Select
												onValueChange={(value) => {
													field.onChange(value);
												}}
												value={field.value}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select type" />
												</SelectTrigger>
												<SelectContent>
													{storageEngine.map((item) => {
														return (
															<SelectItem value={item.value} key={item.id}>
																<Badge variant="success">{item.label}</Badge>
															</SelectItem>
														);
													})}
												</SelectContent>
											</Select>
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
			<Card title="File List">
				<CardHeader>
					<div className="flex items-start justify-start">
						<Button onClick={() => onCreate()} variant="default">
							<Icon icon="solar:add-circle-outline" size={18} />
							Upload
						</Button>
						<Button onClick={() => handleDeleteSelection()} variant="ghost" className="ml-2" disabled={!hasSelected}>
							<Icon icon="solar:trash-bin-minimalistic-outline" size={18} />
							Delete
						</Button>
					</div>
				</CardHeader>

				<CardContent>
					<Table<FileInfo>
						rowKey={(record) => record.id}
						rowSelection={rowSelection}
						scroll={{ x: "max-content" }}
						columns={columns}
						pagination={{
							current: data?.page || condition.pagination?.current || 1,
							pageSize: data?.page_size || condition.pagination?.pageSize || 10,
							total: data?.total || condition?.pagination?.total || 0,
							showTotal: (total) => `共 ${total} 条`,
							showSizeChanger: true,
							pageSizeOptions: ["10", "20", "50", "100"],
						}}
						dataSource={data?.list}
						loading={isLoading}
						onChange={handleTableChange}
					/>
				</CardContent>
				<FileModal {...apiModalProps} />
			</Card>
		</div>
	);
};

export default App;
