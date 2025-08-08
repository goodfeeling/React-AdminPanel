import { useRoleSettingActions, useRoleSettingBtnIds } from "@/store/roleSettingStore";
import type { MenuBtn } from "@/types/entity";
import { Table } from "antd";
import type { TableColumnsType, TableProps } from "antd";
import { useEffect, useState } from "react";
import type { selectMenuData } from "./index";

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

export default MenuBtnSetting;
