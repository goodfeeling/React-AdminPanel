import apiService from "@/api/services/apisService";
import menuService from "@/api/services/menuService";
import roleService from "@/api/services/roleService";
import { Icon } from "@/components/icon";
import type { ApiGroupItem, Menu, MenuTree } from "@/types/entity";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Input, Tree } from "antd";
import type { TreeDataNode, TreeProps } from "antd";
import { useCallback, useEffect, useState } from "react";

const { Search } = Input;
export type SettingValue = {
	id: string;
};

export type SettingModalProps = {
	id: number;
	title: string;
	show: boolean;
	onCancel: VoidFunction;
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

const MenuSetting = ({ id }: { id: number }) => {
	const [searchValue, setSearchValue] = useState("");
	const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
	const [treeData, setTreeData] = useState<MenuTree[]>([]);
	const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
	const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);

	console.log(searchValue);

	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		console.log("onChange", e);
		setSearchValue(e.target.value);
	};
	const onExpand: TreeProps["onExpand"] = (expandedKeysValue) => {
		setExpandedKeys(expandedKeysValue);
		setAutoExpandParent(false);
	};

	// 加载菜单树
	const onLoadMenuTree = useCallback(async () => {
		const response = await menuService.getMenus(0);
		const treeData = [
			{
				value: "0",
				title: "根节点",
				key: "0",
				path: [0],
				children: buildTree(response),
			},
		];
		setTreeData(treeData);
		setExpandedKeys(getAllKeys(treeData));
	}, []);

	// 构建树形结构
	const buildTree = (tree: Menu[]): MenuTree[] => {
		return tree.map((item: Menu): MenuTree => {
			return {
				value: item.id.toString(),
				title: item.title,
				key: item.id.toString(),
				path: item.level,
				children: item.children ? buildTree(item.children) : [],
			};
		});
	};

	// 加载权限菜单绑定数据
	const loadMenuIds = useCallback(async () => {
		const response = await roleService.getRoleSetting(id);
		setCheckedKeys(response.role_menus.map((v) => String(v)));
	}, [id]);

	useEffect(() => {
		onLoadMenuTree();
		loadMenuIds();
	}, [onLoadMenuTree, loadMenuIds]);

	// 更新菜单id
	const updateRoleMenuIds = useCallback(
		async (checkedKeysValue: number[]) => {
			await roleService.updateRoleMenus(id, checkedKeysValue);
		},
		[id],
	);

	const onCheck: TreeProps["onCheck"] = (checkedKeysValue) => {
		console.log("onCheck", checkedKeysValue);
		setCheckedKeys(checkedKeysValue as React.Key[]);
		updateRoleMenuIds(checkedKeysValue as number[]);
	};

	return (
		<div>
			<Search style={{ marginBottom: 8 }} placeholder="Search" onChange={onChange} />
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
				titleRender={(node) => {
					return (
						<span className="flex justify-between items-center w-full">
							<span>{node.title}</span>
							<Button variant="link">设为首页</Button>
							<Button variant="link">配置权限按钮</Button>
						</span>
					);
				}}
			/>
		</div>
	);
};

const ApiSetting = ({ id }: { id: number }) => {
	const [searchValue, setSearchValue] = useState("");
	const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
	const [treeData, setTreeData] = useState<ApiGroupItem[]>([]);
	const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
	const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);

	console.log(searchValue);

	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		console.log("onChange", e);
		setSearchValue(e.target.value);
	};
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

	// 加载权限菜单绑定数据
	const loadMenuIds = useCallback(async () => {
		const response = await roleService.getRoleSetting(id);
		setCheckedKeys(response.role_apis);
	}, [id]);

	useEffect(() => {
		onLoadMenuTree();
		loadMenuIds();
	}, [onLoadMenuTree, loadMenuIds]);

	// 更新菜单id
	const updateRoleMenuIds = useCallback(
		async (checkedKeysValue: string[]) => {
			await roleService.updateRoleApis(id, checkedKeysValue);
		},
		[id],
	);

	const onCheck: TreeProps["onCheck"] = (checkedKeysValue) => {
		console.log("onCheck", checkedKeysValue);
		setCheckedKeys(checkedKeysValue as React.Key[]);
		updateRoleMenuIds(checkedKeysValue as string[]);
	};

	return (
		<div>
			<Search style={{ marginBottom: 8 }} placeholder="Search" onChange={onChange} />
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

export default function SettingModal({ id, title, show, onCancel }: SettingModalProps) {
	console.log(title, show);

	return (
		<Dialog open={show} onOpenChange={(open) => !open && onCancel()}>
			<DialogContent className="sm:max-w-3xl scrollbar-hide">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<Tabs defaultValue="1" className="w-full">
					<div className="sticky top-0 z-10 bg-background">
						<TabsList>
							<TabsTrigger value="1">
								<div className="flex items-center">
									<Icon icon="solar:user-id-bold" size={24} className="mr-2" />
									<span>角色菜单</span>
								</div>
							</TabsTrigger>
							<TabsTrigger value="2">
								<div className="flex items-center">
									<Icon icon="solar:bell-bing-bold-duotone" size={24} className="mr-2" />
									<span>角色api</span>
								</div>
							</TabsTrigger>
						</TabsList>
					</div>
					<TabsContent value="1" className="max-h-[500px] overflow-y-auto">
						<MenuSetting id={id} />
					</TabsContent>
					<TabsContent value="2" className="max-h-[500px] overflow-y-auto">
						<ApiSetting id={id} />
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
