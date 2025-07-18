import { Icon } from "@/components/icon";
import { Button } from "@/ui/button";
import type { TableProps } from "antd";
import { Card, Popconfirm, Table } from "antd";
import { useCallback, useEffect, useState } from "react";
import type { ColumnsType, Menu, MenuGroup, PageList, TableParams } from "#/entity";

import menuGroupService from "@/api/services/menuGroupService";
import menuService from "@/api/services/menuService";
import { CardContent, CardHeader } from "@/ui/card";
import { getRandomUserParams, toURLSearchParams } from "@/utils";
import { toast } from "sonner";
import MenuGroupModal, { type MenuGroupModalProps } from "./group-modal";
import MenuModal, { type MenuModalProps } from "./modal";

const MenuList = ({ selectedId }: { selectedId: number | null }) => {
	const defaultValue: Menu = {
		id: 0,
		menu_level: 0,
		parent_id: 0,
		name: "",
		path: "",
		hidden: 0,
		component: "",
		sort: 0,
		active_name: "",
		keep_alive: 0,
		default_menu: 0,
		title: "",
		icon: "",
		close_tab: 0,
		created_at: "",
		updated_at: "",
		level: [],
		children: [],
	};
	const [data, setData] = useState<Menu[]>();
	const [loading, setLoading] = useState(false);
	const [expandedKeys, setExpandedKeys] = useState<number[]>([]);
	const [menuModalProps, setUserModalProps] = useState<MenuModalProps>({
		formValue: { ...defaultValue },
		title: "New",
		show: false,
		treeRawData: [],
		isCreateSub: false,
		onOk: async (values: Menu) => {
			if (values.id === 0) {
				await menuService.createMenu(values);
			} else {
				await menuService.updateMenu(values.id, values);
			}
			toast.success("success!");
			setUserModalProps((prev) => ({ ...prev, show: false }));
			getData(0);
		},
		onCancel: () => {
			setUserModalProps((prev) => ({ ...prev, show: false }));
		},
	});

	const getData = useCallback(async (selectedId: number) => {
		const response = await menuService.getMenus(selectedId);
		setData(response);
		setLoading(false);
		setUserModalProps((prev) => ({
			...prev,
			treeRawData: response,
		}));
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!selectedId) {
			return;
		}
		setLoading(true);
		getData(selectedId);
	}, [selectedId]);

	const onCreate = (formValue: Menu | undefined, isCreateSub = false) => {
		const setValue = defaultValue;
		if (formValue !== undefined) {
			setValue.parent_id = formValue.id;
		}
		setUserModalProps((prev) => ({
			...prev,
			show: true,
			isCreateSub,
			...setValue,
			title: "New",
			formValue: { ...setValue },
		}));
	};

	const onEdit = (formValue: Menu) => {
		setUserModalProps((prev) => ({
			...prev,
			show: true,
			title: "Edit",
			isCreateSub: false,
			formValue,
		}));
	};

	const handleDelete = async (id: number) => {
		try {
			await menuService.deleteMenu(id);
			toast.success("删除成功");
			getData(0);
		} catch (error) {
			console.error(error);
			toast.error("删除失败");
		}
	};
	const handleExpand = (expanded: boolean, record: Menu) => {
		const keys = expanded ? [...expandedKeys, record.id] : expandedKeys.filter((key) => key !== record.id);
		setExpandedKeys(keys);
	};
	const columns: ColumnsType<Menu> = [
		{
			title: "菜单ID",
			dataIndex: "expand",
			render: (_, record) => {
				const level = record.level.length;
				return record.children?.length ? (
					<Button
						onClick={() => handleExpand(!expandedKeys.includes(record.id), record)}
						variant="ghost"
						size="icon"
						style={{
							marginLeft: record.parent_id !== 0 ? `${level * 20}px` : "",
						}}
					>
						{expandedKeys.includes(record.id) ? "▼" : "▶"}
						<span>{record.id}</span>
					</Button>
				) : (
					<span style={{ marginLeft: `${level * 20}px` }}>{record.id}</span>
				);
			},

			width: 90,
		},
		{
			title: "展示名称",
			dataIndex: "title",
		},
		{
			title: "图标",
			dataIndex: "icon",
		},
		{
			title: "路由Name",
			dataIndex: "name",
		},
		{
			title: "路由Path",
			dataIndex: "path",
		},
		{
			title: "是否显示隐藏",
			dataIndex: "hidden",
		},
		{
			title: "父节点",
			dataIndex: "parent_id",
		},
		{
			title: "排序",
			dataIndex: "sort",
		},
		{
			title: "文件路径",
			dataIndex: "component",
		},
		{
			title: "创建时间",
			dataIndex: "created_at",
		},
		{
			title: "更新时间",
			dataIndex: "updated_at",
		},
		{
			title: "操作",
			key: "operation",
			align: "center",
			width: 300,
			fixed: "right",
			render: (_, record) => (
				<div className="flex w-full justify-center text-gray-500">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => onCreate(record, true)}
						style={{ minWidth: "80px" }}
						className="flex flex-row  items-center justify-center gap-1 px-2 py-1"
					>
						<Icon icon="solar:add-square-bold" size={18} />
						<span className="text-xs">新增子路由</span>
					</Button>
					<Button
						variant="ghost"
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

	return (
		<>
			<CardHeader className="p-0">
				<div className="flex items-start justify-start">
					<Button onClick={() => onCreate(undefined, true)}>
						<Icon icon="solar:add-circle-outline" size={18} />
						New
					</Button>
				</div>
			</CardHeader>

			<CardContent className="p-0">
				<Table<Menu>
					rowKey={(record) => record.id}
					scroll={{ x: "max-content" }}
					columns={columns}
					dataSource={data}
					loading={loading}
					pagination={false}
					expandable={{
						showExpandColumn: false,
						expandedRowKeys: expandedKeys,
						onExpand: (expanded, record) => handleExpand(expanded, record),
					}}
				/>
				<MenuModal {...menuModalProps} />
			</CardContent>
		</>
	);
};

const MenuGroupList = ({
	onSelect,
}: {
	onSelect?: (id: number | null) => void;
}) => {
	const defaultValue: MenuGroup = {
		id: 0,
		name: "",
		path: "",
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
		sortField: "id",
		sortOrder: "descend",
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

const App: React.FC = () => {
	const [selectedId, setSelectedId] = useState<number | null>(null);

	return (
		<div className="flex w-full gap-4">
			<div className="w-1/4 pr-2">
				<Card title="Menu Group List">
					<MenuGroupList onSelect={setSelectedId} />
				</Card>
			</div>
			<div className="w-3/4 pl-2">
				<Card title="Menu List">
					<MenuList selectedId={selectedId} />
				</Card>
			</div>
		</div>
	);
};

export default App;
