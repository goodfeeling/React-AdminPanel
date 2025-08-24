import type { Role, RoleTree } from "@/types/entity";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/ui/toggle-group";
import { Button, Modal, TreeSelect } from "antd";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { BasicStatus } from "#/enum";

export type RoleModalProps = {
	formValue: Role;
	treeRawData: Role[];
	title: string;
	show: boolean;
	onOk: (values: Role) => Promise<boolean>;
	onCancel: VoidFunction;
};
export function buildTree(tree: Role[]): RoleTree[] {
	return tree.map((item: Role): RoleTree => {
		return {
			value: item.id.toString(),
			title: item.name,
			key: item.id.toString(),
			path: item.path,
			children: item.children ? buildTree(item.children) : [],
		};
	});
}
const RoleNewModal = ({ title, show, treeRawData, formValue, onOk, onCancel }: RoleModalProps) => {
	const [loading, setLoading] = useState(false);
	const [open, setOpen] = useState(false);
	const [treeData, setTreeData] = useState<RoleTree[]>([]);
	const form = useForm<Role>({
		defaultValues: formValue,
	});

	useEffect(() => {
		setOpen(show);
	}, [show]);

	useEffect(() => {
		form.reset(formValue);
		setTreeData([
			{
				value: "0",
				title: "根节点",
				key: "0",
				path: [0],
				children: buildTree(treeRawData),
			},
		]);
	}, [formValue, treeRawData, form]);

	const handleOk = async () => {
		form.handleSubmit(async (values) => {
			setLoading(true);
			const res = await onOk(values);
			if (res) {
				setLoading(false);
			}
		})();
	};

	const handleCancel = () => {
		setOpen(false);
		onCancel();
	};

	return (
		<>
			<Modal
				open={open}
				title={title}
				onOk={handleOk}
				onCancel={handleCancel}
				centered
				footer={[
					<Button key="back" onClick={handleCancel}>
						Return
					</Button>,
					<Button key="submit" type="primary" loading={loading} onClick={handleOk}>
						Submit
					</Button>,
				]}
			>
				<Form {...form}>
					<form className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							rules={{ required: "name is required" }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="parent_id"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Parent</FormLabel>
									<FormControl>
										<TreeSelect
											showSearch
											style={{ width: "100%" }}
											value={String(field.value)}
											styles={{
												popup: { root: { maxHeight: 400, overflow: "auto" } },
											}}
											placeholder="Please select"
											allowClear
											treeDefaultExpandAll
											onChange={(value) => {
												field.onChange(Number(value));
											}}
											treeData={treeData}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="label"
							rules={{ required: "label is required" }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>label</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>description</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="order"
							render={({ field }) => (
								<FormItem>
									<FormLabel>order</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="status"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Status</FormLabel>
									<FormControl>
										<ToggleGroup
											type="single"
											variant="outline"
											value={String(field.value)}
											onValueChange={(value) => {
												field.onChange(value);
											}}
										>
											<ToggleGroupItem value={String(BasicStatus.ENABLE)}>Enable</ToggleGroupItem>
											<ToggleGroupItem value={String(BasicStatus.DISABLE)}>Disable</ToggleGroupItem>
										</ToggleGroup>
									</FormControl>
								</FormItem>
							)}
						/>
					</form>
				</Form>
			</Modal>
		</>
	);
};

export default RoleNewModal;
