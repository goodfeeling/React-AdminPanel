import { TreeSelect } from "antd";
import { useEffect, useState } from "react";
import type { Role } from "#/entity";
const { SHOW_PARENT } = TreeSelect;

interface RoleSelectProps {
	roles: Role[];
	treeData: any[];
	recordId: number;
	onChange?: (values: string[]) => void;
}

const RoleSelect: React.FC<RoleSelectProps> = ({ roles, treeData, recordId, onChange }) => {
	const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

	useEffect(() => {
		const ids = roles.map((x: Role) => String(x.id));
		setSelectedRoleIds(ids);
	}, [roles]);

	const handleSelectChange = (values: string[]) => {
		setSelectedRoleIds(values);
		if (onChange) {
			onChange(values);
		}
		console.log(`当前行 ID: ${recordId}，选中的角色 ID:`, values);
	};

	return (
		<TreeSelect
			key={recordId}
			treeData={treeData}
			value={selectedRoleIds}
			onChange={handleSelectChange}
			treeCheckable={true}
			showCheckedStrategy={SHOW_PARENT}
			placeholder="请选择角色"
			style={{ width: "100%" }}
		/>
	);
};

export default RoleSelect;
