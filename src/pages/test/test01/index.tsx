import PermissionButton from "@/components/premission/button";

const SelectDemo = () => {
	return (
		<>
			<PermissionButton
				permissionString={"test"}
				onClick={() => {
					console.log("hello world");
				}}
				className="btn btn-primary"
				variant="link"
			>
				编辑
			</PermissionButton>
		</>
	);
};

export default SelectDemo;
