import { Icon } from "@/components/icon";
import { Button } from "@/ui/button";
import type { TableProps } from "antd";
import { Popconfirm, Table } from "antd";
import { useEffect, useState } from "react";
import type { ColumnsType, MenuGroup } from "#/entity";

import {
	useMenuGroupActions,
	useMenuGroupManageCondition,
	useMenuGroupQuery,
	useRemoveMenuGroupMutation,
	useUpdateOrCreateMenuGroupMutation,
} from "@/store/menuGroupManageStore";
import { CardContent, CardHeader } from "@/ui/card";
import { useTranslation } from "react-i18next";
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
		status: 2,
		created_at: "",
		updated_at: "",
	};
	const { t } = useTranslation();
	const updateOrCreateMutation = useUpdateOrCreateMenuGroupMutation();
	const removeMutation = useRemoveMenuGroupMutation();
	const { data, isLoading } = useMenuGroupQuery();
	const condition = useMenuGroupManageCondition();
	const { setCondition } = useMenuGroupActions();
	const [selectedId, setSelectedId] = useState<number | null>(null);
	const [apiModalProps, setDictionaryModalProps] = useState<MenuGroupModalProps>({
		formValue: { ...defaultValue },
		title: "New",
		show: false,
		onOk: async (values: MenuGroup) => {
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
		if (data && data.list.length > 0 && onSelect) {
			setSelectedId(data.list[0].id);
			onSelect(data.list[0].id);
		}
	}, [data]);

	const handleTableChange: TableProps<MenuGroup>["onChange"] = (pagination, filters, sorter) => {
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
		removeMutation.mutate(id, {
			onSuccess: () => {
				toast.success("删除成功");
			},
			onError: () => {
				toast.error("删除失败");
			},
		});
	};

	const columns: ColumnsType<MenuGroup> = [
		{
			title: "名称",
			dataIndex: "name",
			key: "name",
			ellipsis: true,
			render: (_, record) => {
				return <span>{t(record.name)}</span>;
			},
		},
		{
			title: "操作",
			key: "operation",
			align: "center",
			width: 100,
			render: (_, record) => (
				<div className="flex w-full justify-center text-gray-500">
					<Button
						variant="link"
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
						<Button variant="link" size="icon">
							<Icon icon="mingcute:delete-2-fill" size={18} />
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
						onClick: () => handleRowClick(record),
					})}
					rowClassName={(record: MenuGroup) => {
						return record.id === selectedId
							? "bg-primary  shadow hover:bg-primary/90"
							: "text-gray-700 dark:text-gray-300";
					}}
				/>
				<MenuGroupModal {...apiModalProps} />
			</CardContent>
		</>
	);
};

export default MenuGroupList;
