import apiService from "@/api/services/apisService";
import { useRoleSettingActions } from "@/store/roleSettingStore";
import type { ApiGroupItem } from "@/types/entity";
import { Input, Tree } from "antd";
import type { TreeProps } from "antd";
import { useCallback, useEffect, useState } from "react";
import { getAllKeys } from "./index";
const { Search } = Input;

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

export default ApiSetting;
