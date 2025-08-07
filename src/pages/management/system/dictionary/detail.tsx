import { Icon } from "@/components/icon";
import { Button } from "@/ui/button";
import type { TableProps } from "antd";
import { Popconfirm, Table } from "antd";
import type { TableRowSelection } from "antd/es/table/interface";
import { useEffect, useState } from "react";
import type { ColumnsType, DictionaryDetail } from "#/entity";

import {
	useBatchRemoveDictionaryDetailMutation,
	useDictionaryDetailActions,
	useDictionaryDetailManageCondition,
	useDictionaryDetailQuery,
	useRemoveDictionaryDetailMutation,
	useUpdateOrCreateDictionaryDetailMutation,
} from "@/store/dictionaryDetailManageStore";
import { CardContent, CardHeader } from "@/ui/card";
import { toast } from "sonner";
import DictionaryDetailModal, { type DictionaryDetailModalProps } from "./detail-modal";

const DictionaryDetailList = ({
	selectedDictId,
}: {
	selectedDictId: number | null;
}) => {
	const defaultDictionaryValue: DictionaryDetail = {
		id: 0,
		label: "",
		value: "",
		extend: "",
		status: 2,
		sort: 0,
		sys_dictionary_Id: selectedDictId,
		created_at: "",
		updated_at: "",
	};

	const updateOrCreateMutation = useUpdateOrCreateDictionaryDetailMutation();
	const removeMutation = useRemoveDictionaryDetailMutation();
	const batchRemoveMutation = useBatchRemoveDictionaryDetailMutation();
	const { data, isLoading } = useDictionaryDetailQuery();
	const condition = useDictionaryDetailManageCondition();
	const { setCondition } = useDictionaryDetailActions();

	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [apiModalProps, setDictionaryModalProps] = useState<DictionaryDetailModalProps>({
		formValue: { ...defaultDictionaryValue },
		title: "New Dictionary Detail",
		show: false,
		onOk: async (values: DictionaryDetail) => {
			updateOrCreateMutation.mutate(values, {
				onSuccess: () => {
					toast.success("success!");
					setDictionaryModalProps((prev) => ({ ...prev, show: false }));
				},
			});
		},
		onCancel: () => {
			setDictionaryModalProps((prev) => ({ ...prev, show: false }));
		},
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!selectedDictId) {
			return;
		}
		setCondition({
			...condition,
			searchParams: {
				selectedDictId: selectedDictId || 0,
			},
			pagination: {
				...condition.pagination,
				current: 1,
			},
		});
	}, [selectedDictId]);

	const handleTableChange: TableProps<DictionaryDetail>["onChange"] = (pagination, filters, sorter) => {
		setCondition({
			...condition,
			pagination,
			filters,
			sortOrder: Array.isArray(sorter) ? undefined : condition.sortOrder,
			sortField: Array.isArray(sorter) ? undefined : condition.sortField,
		});
	};

	const onCreate = () => {
		setDictionaryModalProps((prev) => ({
			...prev,
			show: true,
			...defaultDictionaryValue,
			title: "New Dictionary Detail",
			formValue: { ...defaultDictionaryValue },
		}));
	};

	const onEdit = (formValue: DictionaryDetail) => {
		setDictionaryModalProps((prev) => ({
			...prev,
			show: true,
			title: "Edit",
			formValue,
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

	const columns: ColumnsType<DictionaryDetail> = [
		{
			title: "ID",
			dataIndex: "id",
			key: "id",
		},
		{
			title: "展示值",
			dataIndex: "label",
			key: "label",
			ellipsis: true,
		},
		{
			title: "字典值",
			dataIndex: "value",
			key: "value",
		},
		{
			title: "扩展值",
			dataIndex: "extend",
			key: "extend",
		},
		{
			title: "启用状态",
			dataIndex: "status",
			key: "status",
			ellipsis: true,
		},
		{
			title: "排序标记",
			dataIndex: "sort",
			key: "sort",
		},
		{
			title: "创建时间",
			dataIndex: "created_at",
			key: "created_at",
		},

		{
			title: "操作",
			dataIndex: "operation",
			key: "operation",
			align: "center",
			width: 100,
			fixed: "right",
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

	const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
		console.log("selectedRowKeys changed: ", newSelectedRowKeys);
		setSelectedRowKeys(newSelectedRowKeys);
	};

	const rowSelection: TableRowSelection<DictionaryDetail> = {
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
		<>
			<CardHeader className="p-0">
				<div className="flex items-start justify-start">
					<Button onClick={() => onCreate()} variant="default">
						<Icon icon="solar:add-circle-outline" size={18} />
						New
					</Button>
					<Button onClick={() => handleDeleteSelection()} variant="ghost" className="ml-2" disabled={!hasSelected}>
						<Icon icon="solar:trash-bin-minimalistic-outline" size={18} />
						Delete
					</Button>
				</div>
			</CardHeader>

			<CardContent className="p-0">
				<Table<DictionaryDetail>
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
				<DictionaryDetailModal {...apiModalProps} />
			</CardContent>
		</>
	);
};

export default DictionaryDetailList;
