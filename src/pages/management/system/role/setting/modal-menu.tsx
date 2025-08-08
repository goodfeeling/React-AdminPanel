import menuService from "@/api/services/menuService";
import { useRoleSettingActions } from "@/store/roleSettingStore";
import type { MenuBtn, MenuTree, MenuTreeUserGroup } from "@/types/entity";
import { Button } from "@/ui/button";
import { Collapse, Input, Tag, Tree } from "antd";
import type { TreeProps } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getAllKeys, type selectMenuData } from "./index";
import { buildTree } from "../../menu/base/menu-modal";

const { Search } = Input;

type MenuSettingProps = {
	id: number;
	defaultRoleRouter: string;
	menuGroupIds: { [key: string]: number[] };
	setSelectMenuBtn: React.Dispatch<React.SetStateAction<selectMenuData>>;
};

const MenuSetting = ({ id, defaultRoleRouter, menuGroupIds, setSelectMenuBtn }: MenuSettingProps) => {
	const [searchValue, setSearchValue] = useState("");
	const { t } = useTranslation();
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
					const treeData = buildTree(item.items, t);
					return {
						key: item.path,
						label: t(item.name),
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

export default MenuSetting;
