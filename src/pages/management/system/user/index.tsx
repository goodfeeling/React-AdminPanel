import roleService from "@/api/services/roleService";
import userService from "@/api/services/userService";
import { Icon } from "@/components/icon";
import useDictionaryByType from "@/hooks/dict";
import RoleSelect from "@/pages/components/role-select/RoleSelect";
import {
	usePasswordResetMutation,
	useRemoveUserMutation,
	useUpdateOrCreateUserMutation,
	useUserManageActions,
	useUserManageCondition,
	useUserQuery,
} from "@/store/userManageStore";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { CardContent, CardHeader } from "@/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/ui/form";
import type { TableProps } from "antd";
import { Card, Input, Popconfirm, Select, Table } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ColumnsType, RoleTree, UserInfo } from "#/entity";
import { buildTree } from "../role/modal";
import PermissionModal, { type UserModalProps } from "./modal";

const defaultUserValue: UserInfo = {
	id: 0,
	email: "",
	user_name: "",
	nick_name: "",
	header_img: "",
	phone: "",
	status: 0,
	created_at: "",
	updated_at: "",
	roles: [],
	current_role: undefined,
};

type SearchFormFieldType = {
	user_name: string;
	status: string;
};

const searchDefaultValue = {
	user_name: "",
	status: "",
};

const App: React.FC = () => {
	const updateOrCreateMutation = useUpdateOrCreateUserMutation();
	const removeMutation = useRemoveUserMutation();
	const passwordResetMutation = usePasswordResetMutation();
	const { data, isLoading } = useUserQuery();
	const condition = useUserManageCondition();
	const { setCondition } = useUserManageActions();
	const [treeData, setTreeData] = useState<RoleTree[]>([]);
	const statusType = useDictionaryByType("status");
	const searchForm = useForm<SearchFormFieldType>({
		defaultValues: searchDefaultValue,
	});

	const [userModalProps, setUserModalProps] = useState<UserModalProps>({
		formValue: { ...defaultUserValue },
		title: "New",
		treeData: [],
		show: false,
		onOk: async (values: UserInfo): Promise<boolean> => {
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

	const handleTableChange: TableProps<UserInfo>["onChange"] = (pagination, filters, sorter) => {
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

	const onResetPassword = (id: number) => {
		passwordResetMutation.mutate(id, {
			onSuccess: () => {
				toast.success("重置成功");
			},
			onError: () => {
				toast.error("操作失败");
			},
		});
	};

	const getTreeData = useCallback(async () => {
		const response = await roleService.getRoles();
		const treeData = buildTree(response);
		setTreeData(treeData);
		setUserModalProps((prev) => ({
			...prev,
			treeData,
		}));
	}, []);

	useEffect(() => {
		getTreeData();
	}, [getTreeData]);

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

	const onCreate = () => {
		setUserModalProps((prev) => ({
			...prev,
			show: true,
			...defaultUserValue,
			title: "New",
			formValue: { ...defaultUserValue },
		}));
	};

	const onEdit = (formValue: UserInfo) => {
		setUserModalProps((prev) => ({
			...prev,
			show: true,
			title: "Edit",
			formValue,
		}));
	};

	const columns: ColumnsType<UserInfo> = [
		{
			title: "ID",
			dataIndex: "id",
			sorter: true,
			width: "5%",
		},
		{
			title: "用户",
			dataIndex: "user_name",
			width: 300,
			render: (_, record) => {
				return (
					<div className="flex">
						<img alt="" src={record.header_img} className="h-10 w-10 rounded-full" />
						<div className="ml-2 flex flex-col">
							<span className="text-sm">{record.user_name}</span>
							<span className="text-xs text-text-secondary">{record.email}</span>
						</div>
					</div>
				);
			},
		},

		{
			title: "昵称",
			dataIndex: "nick_name",
		},
		{
			title: "手机",
			dataIndex: "phone",
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
			title: "角色",
			dataIndex: "roles",
			width: 350,
			render: (roles, record) => {
				return (
					<RoleSelect
						roles={roles}
						treeData={treeData}
						recordId={record.id}
						onChange={async (values) => {
							try {
								await userService.bindRole(record.id, values);
								console.log("更新成功");
							} catch (error) {
								console.error("更新失败:", error);
							}
						}}
					/>
				);
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
					<Button
						variant="link"
						size="icon"
						onClick={() => onResetPassword(record.id)}
						style={{ minWidth: "90px" }}
						className="flex flex-row  items-center justify-center gap-1 px-2 py-1"
					>
						<Icon icon="solar:restart-line-duotone" size={18} />
						<span className="text-xs">重置密码</span>
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
		<div className="flex flex-col gap-4">
			<Card>
				<CardContent>
					<Form {...searchForm}>
						<div className="flex items-center gap-4">
							<FormField
								control={searchForm.control}
								name="user_name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>UserName</FormLabel>
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
										<Select
											style={{ width: 120 }}
											onChange={(value: string) => {
												field.onChange(value);
											}}
											value={String(field.value)}
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
			<Card title="User List">
				<CardHeader>
					<div className="flex items-center justify-between">
						<Button onClick={() => onCreate()}>
							<Icon icon="solar:add-circle-outline" size={18} />
							New
						</Button>
					</div>
				</CardHeader>

				<CardContent>
					<Table<UserInfo>
						rowKey={(record) => record.id}
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
				<PermissionModal {...userModalProps} />
			</Card>
		</div>
	);
};

export default App;
