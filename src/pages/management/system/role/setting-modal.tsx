import apiService from "@/api/services/apisService";
import menuService from "@/api/services/menuService";
import { Icon } from "@/components/icon";
import {
	useRoleSettingActions,
	useRoleSettingApiIds,
	useRoleSettingBtnIds,
	useRoleSettingMenuIds,
} from "@/store/roleSettingStore";
import type { ApiGroupItem, MenuBtn, MenuTree, MenuTreeUserGroup, Role } from "@/types/entity";
import { Button } from "@/ui/button";
import { Card, Collapse, Input, Modal, Table, Tabs, Tag, Tree } from "antd";
import type { TableColumnsType, TableProps, TreeDataNode, TreeProps } from "antd";
import { useCallback, useEffect, useState } from "react";
import { buildTree } from "../menu/menu-modal";
const { Search } = Input;
export type SettingValue = {
	id: string;
};

const getAllKeys = (data: TreeDataNode[]): React.Key[] => {
	return data.reduce((acc, node) => {
		acc.push(node.key);
		if (node.children) {
			acc.push(...getAllKeys(node.children));
		}
		return acc;
	}, [] as React.Key[]);
};

type MenuSettingProps = {
	id: number;
	defaultRoleRouter: string;
	menuGroupIds: { [key: string]: number[] };
	setSelectMenuBtn: React.Dispatch<React.SetStateAction<selectMenuData>>;
};

const MenuSetting = ({ id, defaultRoleRouter, menuGroupIds, setSelectMenuBtn }: MenuSettingProps) => {
	const [searchValue, setSearchValue] = useState("");
	const [roleMenuData, setRoleMenuData] = useState<{ [key: string]: any }>([]);
	const [groupData, setGroupData] = useState<MenuTreeUserGroup[]>([]);
	const [defaultRouter, setDefaultRouter] = useState<string>("");

	// 加载菜单树
	const onLoadMenuTree = useCallback(async () => {
		const response = await menuService.getUserMenu(true);
		setGroupData(response);
	}, []);

	useEffect(() => {
		setRoleMenuData(menuGroupIds);
	}, [menuGroupIds]);

	useEffect(() => {
		onLoadMenuTree();
	}, [onLoadMenuTree]);

	// 默认路由
	useEffect(() => {
		setDefaultRouter(defaultRoleRouter);
	}, [defaultRoleRouter]);

	return (
		<div>
			<Search
				style={{ marginBottom: 8 }}
				placeholder="Search"
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
					console.log("onChange", e);
					setSearchValue(e.target.value);
					console.log(searchValue);
				}}
			/>
			<Collapse
				accordion
				items={groupData.map((item: MenuTreeUserGroup) => {
					const treeData = buildTree(item.items);
					return {
						key: item.path,
						label: item.name,
						children: (
							<TreeList
								id={id}
								groupId={item.id}
								defaultRouter={defaultRouter}
								treeData={treeData}
								checkKeys={roleMenuData}
								setSelectMenuBtn={setSelectMenuBtn}
								setDefaultRouter={setDefaultRouter}
							/>
						),
					};
				})}
			/>
		</div>
	);
};

type TreeListProps = {
	id: number;
	defaultRouter: string;
	treeData: MenuTree[];
	checkKeys: { [key: string]: any };
	groupId: number;
	setSelectMenuBtn: (selectMenuData: selectMenuData) => void;
	setDefaultRouter: React.Dispatch<React.SetStateAction<string>>;
};
const TreeList = ({
	id,
	defaultRouter,
	treeData,
	checkKeys,
	groupId,
	setSelectMenuBtn,
	setDefaultRouter,
}: TreeListProps) => {
	const { updateMenus, updateRouterPath } = useRoleSettingActions();
	const [checkedKeys, setCheckedKeys] = useState<React.Key[]>();

	useEffect(() => {
		const tempData = checkKeys[groupId];
		if (tempData && tempData.length > 0) {
			setCheckedKeys(tempData.map((item: number) => String(item)));
		} else {
			// 如果没有数据，确保清空选中状态
			setCheckedKeys([]);
		}
	}, [checkKeys, groupId]);

	// 组件卸载时清理状态
	useEffect(() => {
		return () => {
			setCheckedKeys([]);
		};
	}, []);
	const onCheck: TreeProps["onCheck"] = (checkedKeysValue) => {
		console.log("onCheck", checkedKeysValue);
		setCheckedKeys(checkedKeysValue as React.Key[]);
		updateMenus(id, String(groupId), checkedKeysValue as number[]);
	};
	// 更新默认路由
	const updateDefaultRouter = (data: MenuTree) => {
		const routerPath = data.origin ? data.origin.path : "";
		setDefaultRouter(routerPath);
		updateRouterPath(id, routerPath);
	};
	// 配置可控按钮
	const settingRoleBtn = (data: MenuTree, menuBtns: MenuBtn[] | undefined) => {
		setSelectMenuBtn({
			menuId: data.origin ? data.origin.id : 0,
			menuBtns: menuBtns ? menuBtns : [],
			isSet: true,
		});
	};
	return (
		<Tree
			checkable
			selectable={false}
			expandedKeys={getAllKeys(treeData)}
			onCheck={onCheck}
			checkedKeys={checkedKeys}
			treeData={treeData}
			multiple={true}
			className="no-hover-tree" // 添加类名禁用悬停效果
			titleRender={(node) => {
				const hasBtn = node.origin?.menu_btns && node.origin.menu_btns.length > 0;
				return (
					<span className="flex justify-between items-center w-full">
						<span>{node.title}</span>
						{defaultRouter === node.origin?.path ? (
							<Tag color="blue">首页</Tag>
						) : (
							<Button
								variant="link"
								onClick={(e) => {
									e.stopPropagation();
									updateDefaultRouter(node);
								}}
							>
								设为首页
							</Button>
						)}
						<Button
							variant="ghost"
							onClick={(e) => {
								e.stopPropagation();
								settingRoleBtn(node, node.origin?.menu_btns);
							}}
							hidden={!hasBtn}
						>
							配置权限按钮
						</Button>
					</span>
				);
			}}
		/>
	);
};

type ApiSettingProps = {
	id: number;
	apiIds: string[];
};
const ApiSetting = ({ id, apiIds }: ApiSettingProps) => {
	const { updateApis } = useRoleSettingActions();
	const [searchValue, setSearchValue] = useState("");
	const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
	const [treeData, setTreeData] = useState<ApiGroupItem[]>([]);
	const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
	const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);

	useEffect(() => {
		setCheckedKeys(apiIds);
	}, [apiIds]);

	const onExpand: TreeProps["onExpand"] = (expandedKeysValue) => {
		setExpandedKeys(expandedKeysValue);
		setAutoExpandParent(false);
	};

	// 加载菜单树
	const onLoadMenuTree = useCallback(async () => {
		const response = await apiService.getApiGroupList();

		setTreeData(response);
		setExpandedKeys(getAllKeys(response));
	}, []);

	useEffect(() => {
		onLoadMenuTree();
	}, [onLoadMenuTree]);

	const onCheck: TreeProps["onCheck"] = (checkedKeysValue) => {
		console.log("onCheck", checkedKeysValue);
		setCheckedKeys(checkedKeysValue as React.Key[]);
		updateApis(id, checkedKeysValue as string[]);
	};

	return (
		<div>
			<Search
				style={{ marginBottom: 8 }}
				placeholder="Search"
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
					console.log("onChange", e);
					setSearchValue(e.target.value);
					console.log(searchValue);
				}}
			/>
			<Tree
				checkable
				onExpand={onExpand}
				selectable={false}
				expandedKeys={expandedKeys}
				autoExpandParent={autoExpandParent}
				onCheck={onCheck}
				checkedKeys={checkedKeys}
				treeData={treeData}
				multiple={true}
				className="no-hover-tree"
				titleRender={(node) => {
					return (
						<span className="custom-tree-node flex justify-between items-center w-full">
							<span>{node.title}</span>
							<span className="text-sm text-primary-foreground">{node.children === null ? node.key : ""}</span>
						</span>
					);
				}}
			/>
		</div>
	);
};

type MenuBtnSettingProps = {
	selectMenuBtn: selectMenuData;
	roleId: number;
};
const MenuBtnSetting = ({ selectMenuBtn, roleId }: MenuBtnSettingProps) => {
	const menuBtnIds = useRoleSettingBtnIds();
	const { updateRoleBtns } = useRoleSettingActions();
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [menuBtnData, setMenuBtnData] = useState<MenuBtn[]>([]);
	const columns: TableColumnsType<MenuBtn> = [
		{
			title: "名称",
			dataIndex: "name",
		},
		{
			title: "描述",
			dataIndex: "desc",
		},
	];

	useEffect(() => {
		setMenuBtnData(selectMenuBtn.menuBtns);
		setSelectedRowKeys(menuBtnIds[selectMenuBtn.menuId]);
	}, [menuBtnIds, selectMenuBtn]);

	const rowSelection: TableProps<MenuBtn>["rowSelection"] = {
		selectedRowKeys,
		type: "checkbox",
		onChange: (selectedRowKeys) => {
			setSelectedRowKeys(selectedRowKeys);
			updateRoleBtns(roleId, selectMenuBtn.menuId, selectedRowKeys as number[]);
		},
		selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE],
	};
	return (
		<>
			<Table<MenuBtn>
				rowKey={"id"}
				rowSelection={rowSelection}
				columns={columns}
				dataSource={menuBtnData}
				pagination={false}
				onChange={(value) => {
					console.log("selectedRowKeys changed: ", value);
				}}
			/>
		</>
	);
};
export type SettingModalProps = {
	roleData: Role;
	id: number;
	title: string;
	show: boolean;
	onCancel: VoidFunction;
};

type selectMenuData = { menuId: number; menuBtns: MenuBtn[]; isSet: boolean };

export default function SettingModal({ roleData, title, show, onCancel }: SettingModalProps) {
	const menuGroupIds = useRoleSettingMenuIds();
	const ApiIds = useRoleSettingApiIds();
	const { fetch } = useRoleSettingActions();
	const [selectMenuBtn, setSelectMenuBtn] = useState<selectMenuData>({
		menuId: 0,
		menuBtns: [],
		isSet: false,
	});
	useEffect(() => {
		if (show && roleData.id) {
			fetch(roleData.id);
		}
	}, [roleData.id, fetch, show]);
	return (
		<Modal
			title={title}
			closable={{ "aria-label": "Custom Close Button" }}
			open={show}
			onCancel={() => {
				onCancel();
				setSelectMenuBtn({
					menuId: 0,
					menuBtns: [],
					isSet: false,
				});
			}}
			footer={null}
			width={800}
			centered
		>
			<Tabs
				hidden={selectMenuBtn.isSet}
				defaultActiveKey="1"
				items={[
					{
						key: "1",
						label: "角色菜单",
						children: (
							<div className="max-h-[600px] overflow-y-auto">
								<MenuSetting
									id={roleData.id}
									defaultRoleRouter={roleData.default_router}
									menuGroupIds={menuGroupIds}
									setSelectMenuBtn={setSelectMenuBtn}
								/>
							</div>
						),
					},
					{
						key: "2",
						label: "角色api",
						children: (
							<div className="max-h-[600px] overflow-y-auto">
								<ApiSetting id={roleData.id} apiIds={ApiIds} />
							</div>
						),
					},
				]}
				onChange={(key: string) => {
					console.log(key);
				}}
			/>
			<Card
				hidden={!selectMenuBtn.isSet}
				title={
					<Button
						variant="ghost"
						size="sm"
						className="flex items-center gap-2 px-3 py-2 hover:bg-accent rounded-md transition-colors"
						onClick={() =>
							setSelectMenuBtn((prev) => ({
								...prev,
								isSet: false,
							}))
						}
					>
						<Icon icon="solar:alt-arrow-left-outline" className="text-3xl" />
						<span className="text-sm">返回</span>
					</Button>
				}
			>
				<MenuBtnSetting selectMenuBtn={selectMenuBtn} roleId={roleData.id} />
			</Card>
		</Modal>
	);
}
