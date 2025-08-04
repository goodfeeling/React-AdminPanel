import { Icon } from "@/components/icon";
import { Button } from "@/ui/button";
import type { TableProps } from "antd";
import { Popconfirm, Table } from "antd";
import { useCallback, useEffect, useState } from "react";
import type { ColumnsType, MenuGroup, PageList, TableParams } from "#/entity";

import menuGroupService from "@/api/services/menuGroupService";
import { CardContent, CardHeader } from "@/ui/card";
import { getRandomUserParams, toURLSearchParams } from "@/utils";
import { toast } from "sonner";
import MenuGroupModal, { type MenuGroupModalProps } from "./group-modal";

const MenuGroupList = ({
	onSelect,
}: {
	onSelect?: (id: number | null) => void;
}) => {
	const defaultValue: MenuGroup = {
		id: 0,
		name: "",
		path: "",
		sort: 0,
		status: false,
		created_at: "",
		updated_at: "",
	};
	const [data, setData] = useState<PageList<MenuGroup>>();
	const [loading, setLoading] = useState(false);
	const [selectedId, setSelectedId] = useState<number | null>(null);
	const [tableParams, setTableParams] = useState<TableParams>({
		pagination: {
			current: 1,
			pageSize: 10,
			total: 0,
		},
		sortField: "sort",
		sortOrder: "ascend",
	});
	const [apiModalProps, setDictionaryModalProps] = useState<MenuGroupModalProps>({
		formValue: { ...defaultValue },
		title: "New",
		show: false,
		onOk: async (values: MenuGroup) => {
			if (values.id === 0) {
				await menuGroupService.createMenuGroup(values);
			} else {
				await menuGroupService.updateMenuGroup(values.id, values);
			}
			toast.success("success!");
			setDictionaryModalProps((prev) => ({ ...prev, show: false }));
			getData();
		},
		onCancel: () => {
			setDictionaryModalProps((prev) => ({ ...prev, show: false }));
		},
	});

	const getData = useCallback(async () => {
		const params = toURLSearchParams(getRandomUserParams(tableParams));
		const response = await menuGroupService.searchPageList(params.toString());
		setData(response);
		setTableParams((prev) => ({
			...prev,
			pagination: {
				...prev.pagination,
				current: response.page,
				total: response.total,
				pageSize: response.page_size,
			},
		}));
		if (response.list.length > 0 && onSelect) {
			setSelectedId(response.list[0].id);
			onSelect(response.list[0].id);
		}
		setLoading(false);
	}, [tableParams, onSelect]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		setLoading(true);
		getData();
	}, [
		tableParams.pagination?.current,
		tableParams.pagination?.pageSize,
		tableParams?.sortOrder,
		tableParams?.sortField,
		JSON.stringify(tableParams.filters),
	]);

	const handleTableChange: TableProps<MenuGroup>["onChange"] = (pagination, filters, sorter) => {
		setTableParams({
			pagination,
			filters,
			sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
			sortField: Array.isArray(sorter) ? undefined : sorter.field,
		});

		// `dataSource` is useless since `pageSize` changed
		if (pagination.pageSize !== tableParams.pagination?.pageSize) {
			setData(undefined);
		}
	};

	const onCreate = () => {
		setDictionaryModalProps((prev) => ({
			...prev,
			show: true,
			...defaultValue,
			title: "New",
			formValue: { ...defaultValue },
		}));
	};

	const onEdit = (formValue: MenuGroup) => {
		setDictionaryModalProps((prev) => ({
			...prev,
			show: true,
			title: "Edit",
			formValue,
		}));
	};

	const handleDelete = async (id: number) => {
		try {
			await menuGroupService.deleteMenuGroup(id);
			toast.success("删除成功");
			getData();
		} catch (error) {
			console.error(error);
			toast.error("删除失败");
		}
	};

	const columns: ColumnsType<MenuGroup> = [
		{
			title: "名称",
			dataIndex: "name",
			key: "name",
			ellipsis: true,
		},
		{
			title: "操作",
			key: "operation",
			align: "center",
			width: 100,
			render: (_, record) => (
				<div className="flex w-full justify-center text-gray-500">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => onEdit(record)}
						className="flex flex-row  items-center justify-center gap-1 px-2 py-1"
					>
						<Icon icon="solar:pen-bold-duotone" size={18} />
					</Button>
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
						</Button>
					</Popconfirm>
				</div>
			),
		},
	];

	const handleRowClick = (record: MenuGroup) => {
		setSelectedId(record.id);
		if (onSelect) {
			onSelect(record.id);
		}
	};

	const rowClassName = (record: MenuGroup) => {
		return record.id === selectedId ? "text-primary-foreground" : "";
	};

	return (
		<>
			<CardHeader className="p-0">
				<div className="flex items-start justify-start">
					<Button onClick={() => onCreate()} variant="default">
						<Icon icon="solar:add-circle-outline" size={18} />
						New
					</Button>
				</div>
			</CardHeader>

			<CardContent className="p-0">
				<Table<MenuGroup>
					rowKey={(record) => record.id}
					scroll={{ x: "100%" }}
					columns={columns}
					pagination={{
						current: tableParams.pagination?.current || 1,
						pageSize: tableParams.pagination?.pageSize || 10,
						total: tableParams?.pagination?.total || 0,
						showTotal: (total) => `共 ${total} 条`,
						showSizeChanger: true,
						pageSizeOptions: ["10", "20", "50", "100"],
					}}
					dataSource={data?.list}
					loading={loading}
					onChange={handleTableChange}
					onRow={(record) => ({
						onClick: () => handleRowClick(record),
					})}
					rowClassName={rowClassName}
				/>
				<MenuGroupModal {...apiModalProps} />
			</CardContent>
		</>
	);
};

export default MenuGroupList;
