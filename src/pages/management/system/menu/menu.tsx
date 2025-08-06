import { Icon } from "@/components/icon";
import { Button } from "@/ui/button";
import { Popconfirm, Table } from "antd";
import { useEffect, useState } from "react";
import type { ColumnsType, Menu } from "#/entity";

import { useMenuQuery, useRemoveMenuMutation, useUpdateOrCreateMenuMutation } from "@/store/menuManageStore";
import { CardContent, CardHeader } from "@/ui/card";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import MenuModal, { type MenuModalProps } from "./menu-modal";
import SettingModal, { type SettingModalProps } from "./setting-modal";

const MenuList = ({ selectedId }: { selectedId: number | null }) => {
	const defaultValue: Menu = {
		id: 0,
		menu_level: 0,
		parent_id: 0,
		name: "",
		path: "",
		hidden: false,
		component: "",
		sort: 0,
		active_name: "",
		keep_alive: 0,
		default_menu: 0,
		title: "",
		icon: "",
		close_tab: 0,
		menu_group_id: selectedId ? selectedId : 0,
		created_at: "",
		updated_at: "",
		level: [],
		children: [],
	};

	const updateOrCreateMutation = useUpdateOrCreateMenuMutation();
	const removeMutation = useRemoveMenuMutation();
	const { data, isLoading } = useMenuQuery(selectedId ?? 0);
	const { t } = useTranslation();
	const [expandedKeys, setExpandedKeys] = useState<number[]>([]);

	const [menuModalProps, setUserModalProps] = useState<MenuModalProps>({
		formValue: { ...defaultValue },
		title: "New",
		show: false,
		treeRawData: [],
		onOk: async (values: Menu): Promise<boolean> => {
			updateOrCreateMutation.mutate(values, {
				onSuccess: () => {
					toast.success("success!");
					setUserModalProps((prev) => ({ ...prev, show: false }));
				},
			});
			return true;
		},
		onCancel: () => {
			setUserModalProps((prev) => ({ ...prev, show: false }));
		},
	});

	const [settingModalProps, setSettingModalProps] = useState<SettingModalProps>({
		formValue: { id: 0 },
		title: "New",
		show: false,
		onCancel: () => {
			setSettingModalProps((prev) => ({ ...prev, show: false }));
		},
	});

	useEffect(() => {
		if (data) {
			setUserModalProps((prev) => ({
				...prev,
				treeRawData: data,
			}));
		}
	}, [data]);

	// create menu
	const onCreate = (formValue: Menu | undefined) => {
		const setValue = defaultValue;
		if (formValue !== undefined) {
			setValue.parent_id = formValue.id;
		}

		setUserModalProps((prev) => ({
			...prev,
			show: true,
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
			formValue,
		}));
	};

	const onSetting = (formValue: Menu) => {
		setSettingModalProps((prev) => ({
			...prev,
			show: true,
			title: "Setting",
			formValue: { id: formValue.id },
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
			render: (_, record) => {
				return <span>{t(record.title)}</span>;
			},
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
			width: 350,
			fixed: "right",
			render: (_, record) => (
				<div className="flex w-full justify-between gap-4 text-gray-500">
					<Button variant="link" size="icon" onClick={() => onCreate(record)} style={{ marginLeft: "10px" }}>
						<Icon icon="solar:add-square-bold" size={18} />
						<span>新增子路由</span>
					</Button>

					<Button variant="link" size="icon" onClick={() => onEdit(record)}>
						<Icon icon="solar:pen-bold-duotone" size={18} />
						<span>修改</span>
					</Button>
					<Button variant="link" size="icon" onClick={() => onSetting(record)}>
						<Icon icon="solar:pen-new-square-outline" size={18} />
						<span>按钮与参数</span>
					</Button>
					<Popconfirm
						title="Delete the task"
						description="Are you sure to delete this task?"
						onConfirm={() => handleDelete(record.id)}
						okText="Yes"
						cancelText="No"
					>
						<Button variant="linkwarning" size="icon">
							<Icon icon="mingcute:delete-2-fill" size={18} className="text-error!" />
							<span>删除</span>
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
					<Button onClick={() => onCreate(undefined)}>
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
					loading={isLoading}
					pagination={false}
					expandable={{
						showExpandColumn: false,
						expandedRowKeys: expandedKeys,
						onExpand: (expanded, record) => handleExpand(expanded, record),
					}}
				/>
				<MenuModal {...menuModalProps} />
				<SettingModal {...settingModalProps} />
			</CardContent>
		</>
	);
};

export default MenuList;
