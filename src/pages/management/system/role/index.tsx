import { Icon } from "@/components/icon";
import { useRemoveRoleMutation, useRoleQuery, useUpdateOrCreateRoleMutation } from "@/store/roleManageStore";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import type { TableProps } from "antd";
import { Popconfirm, Table } from "antd";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Role } from "#/entity";
import RoleModal, { type RoleModalProps } from "./modal";
import SettingModal, { type SettingModalProps } from "./setting/index";

type ColumnsType<T extends object = object> = TableProps<T>["columns"];

const defaultValue: Role = {
	id: 0,
	parent_id: 0,
	name: "",
	label: "",
	order: 0,
	description: "",
	status: false,
	created_at: "",
	updated_at: "",
	default_router: "",
	children: [],
	path: [],
};

const App: React.FC = () => {
	const updateOrCreateMutation = useUpdateOrCreateRoleMutation();
	const removeMutation = useRemoveRoleMutation();
	const { data, isLoading } = useRoleQuery();
	const [expandedKeys, setExpandedKeys] = useState<number[]>([]);

	const [settingModalPros, setSettingModalProps] = useState<SettingModalProps>({
		id: 0,
		roleData: { ...defaultValue },
		title: "New",
		show: false,
		onCancel: () => {
			setSettingModalProps((prev) => ({ ...prev, show: false }));
		},
	});

	const [roleModalProps, setRoleModalProps] = useState<RoleModalProps>({
		formValue: { ...defaultValue },
		title: "New",
		show: false,
		treeRawData: [],
		onOk: async (values: Role): Promise<boolean> => {
			updateOrCreateMutation.mutate(values, {
				onSuccess: () => {
					toast.success("success!");
					setRoleModalProps((prev) => ({ ...prev, show: false }));
				},
			});
			return true;
		},
		onCancel: () => {
			setRoleModalProps((prev) => ({ ...prev, show: false }));
		},
	});

	useEffect(() => {
		if (data) {
			setRoleModalProps((prev) => ({
				...prev,
				treeRawData: data,
			}));
		}
	}, [data]);

	const onCreate = (formValue: Role | undefined) => {
		const setValue = defaultValue;
		if (formValue !== undefined) {
			setValue.parent_id = formValue.id;
		}
		setRoleModalProps((prev) => ({
			...prev,
			show: true,
			...setValue,
			title: "New",
			formValue: { ...setValue },
		}));
	};

	const onEdit = (formValue: Role) => {
		setRoleModalProps((prev) => ({
			...prev,
			show: true,
			title: "Edit",
			formValue,
		}));
	};

	const onSetting = (value: Role) => {
		setSettingModalProps((prev) => ({
			...prev,
			show: true,
			title: "角色设置",
			id: value.id,
			roleData: value,
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

	const handleExpand = (expanded: boolean, record: Role) => {
		const keys = expanded ? [...expandedKeys, record.id] : expandedKeys.filter((key) => key !== record.id);
		setExpandedKeys(keys);
	};

	const columns: ColumnsType<Role> = [
		{
			title: "角色ID",
			dataIndex: "expand",
			render: (_, record) => {
				const level = record.path.length;
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
			title: "名称",
			dataIndex: "name",
		},
		{
			title: "标签",
			dataIndex: "label",
		},
		{
			title: "排序",
			dataIndex: "order",
		},
		{
			title: "描述",
			dataIndex: "description",
		},
		{
			title: "状态",
			dataIndex: "status",
			align: "center",
			width: 120,
			render: (status) => {
				return <Badge variant={status ? "success" : "error"}>{status ? "Enable" : "Disabled"}</Badge>;
			},
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
						variant="link"
						size="icon"
						onClick={() => onSetting(record)}
						style={{ minWidth: "110px" }}
						className="flex flex-row  items-center justify-center gap-1 px-2 py-1"
					>
						<Icon icon="solar:settings-bold" size={18} />
						<span className="text-xs">设置权限</span>
					</Button>
					<Button
						variant="link"
						size="icon"
						onClick={() => onCreate(record)}
						style={{ minWidth: "80px" }}
						className="flex flex-row  items-center justify-center gap-1 px-2 py-1"
					>
						<Icon icon="solar:add-square-bold" size={18} />
						<span className="text-xs">新增子角色</span>
					</Button>
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

	return (
		<Card title="Role List">
			<CardHeader>
				<div className="flex items-center justify-between">
					<Button onClick={() => onCreate(undefined)}>
						<Icon icon="solar:add-circle-outline" size={18} />
						New
					</Button>
				</div>
			</CardHeader>

			<CardContent>
				<Table
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
			</CardContent>
			<RoleModal {...roleModalProps} />
			<SettingModal {...settingModalPros} />
		</Card>
	);
};

export default App;
