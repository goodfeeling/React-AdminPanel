import type { Menu, MenuTree } from "@/types/entity";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/ui/form";
import { IconPicker } from "@/ui/icon-picker";
import { Input } from "@/ui/input";

import type { TreeNode } from "@/ui/tree-select-input";
import { buildFileTree } from "@/utils/tree";
import { Button, Modal, Switch, TreeSelect } from "antd";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
export type MenuModalProps = {
	formValue: Menu;
	treeRawData: Menu[];
	title: string;
	show: boolean;
	onOk: (values: Menu) => Promise<boolean>;
	onCancel: VoidFunction;
};
// 构建树形结构
export const buildTree = (tree: Menu[]): MenuTree[] => {
	return tree.map((item: Menu): MenuTree => {
		return {
			value: item.id.toString(),
			title: item.title,
			key: item.id.toString(),
			path: item.level,
			origin: item,
			children: item.children ? buildTree(item.children) : [],
		};
	});
};
const MenuNewModal = ({ title, show, treeRawData, formValue, onOk, onCancel }: MenuModalProps) => {
	const [loading, setLoading] = useState(false);
	const [open, setOpen] = useState(false);
	const [treeData, setTreeData] = useState<MenuTree[]>([]);
	const [dirTree, setDirTree] = useState<TreeNode[]>([]);
	const form = useForm<Menu>({
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

		// file dir tree
		const modules = import.meta.glob("/src/pages/**/*.tsx");
		const filePaths = Object.keys(modules).map(
			(path) => path.replace("/src", "").replace(".tsx", ""), // 去掉 `/src/pages` 前缀
		);
		const tree = buildFileTree(filePaths);
		setDirTree(tree ? (tree.children ? tree.children : []) : []);
		console.log(tree);
	}, [formValue, treeRawData, form]);

	const handleOk = async () => {
		const values = form.getValues();
		setLoading(true);
		const res = await onOk(values);
		if (res) {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		setOpen(false);
		onCancel();
	};

	return (
		<>
			<Modal
				width={800}
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
					<div className="grid grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="component"
							render={({ field }) => (
								<FormItem>
									<FormLabel>文件路径</FormLabel>
									<FormControl>
										<TreeSelect
											showSearch
											style={{ width: "100%" }}
											value={field.value}
											styles={{
												popup: { root: { maxHeight: 400, overflow: "auto" } },
											}}
											placeholder="Please select"
											allowClear
											treeDefaultExpandAll
											onChange={(value) => {
												console.log(value); // components/animate/index.tsx
												field.onChange(value);
											}}
											treeData={dirTree}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>展示名称</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>路由Name</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="path"
							render={({ field }) => (
								<FormItem>
									<FormLabel>路由Path</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="hidden"
							render={({ field }) => (
								<FormItem>
									<FormLabel>是否隐藏</FormLabel>
									<FormControl>
										<div className="w-fit">
											<Switch checked={field.value} onChange={(value) => field.onChange(value)} />
										</div>
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="parent_id"
							render={({ field }) => (
								<FormItem>
									<FormLabel>父节点ID</FormLabel>
									<FormControl>
										<TreeSelect
											showSearch
											style={{ width: "100%" }}
											value={field.value}
											styles={{
												popup: { root: { maxHeight: 400, overflow: "auto" } },
											}}
											placeholder="Please select"
											allowClear
											treeDefaultExpandAll
											onChange={(value) => {
												field.onChange(value);
											}}
											treeData={treeData}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="icon"
							render={({ field }) => (
								<FormItem>
									<FormLabel>图标</FormLabel>
									<FormControl>
										<IconPicker value={field.value} onChange={field.onChange} />
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="sort"
							render={({ field }) => (
								<FormItem>
									<FormLabel>排序标记</FormLabel>
									<FormControl>
										<Input
											{...field}
											type="number" // 设置输入框为数字类型
											onChange={(e) => {
												// 将输入值转换为数字后更新表单字段
												field.onChange(Number(e.target.value));
											}}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="active_name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>高亮</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="keep_alive"
							render={({ field }) => (
								<FormItem>
									<FormLabel>KeepAlive</FormLabel>
									<FormControl>
										<div className="w-fit">
											<Switch
												checked={field.value === 1}
												onChange={(value) => field.onChange(value === true ? 1 : 0)}
											/>
										</div>
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="close_tab"
							render={({ field }) => (
								<FormItem>
									<FormLabel>CloseTab</FormLabel>
									<FormControl>
										<div className="w-fit">
											<Switch
												checked={field.value === 1}
												onChange={(value) => field.onChange(value === true ? 1 : 0)}
											/>
										</div>
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="default_menu"
							render={({ field }) => (
								<FormItem>
									<FormLabel>是否为基础页面</FormLabel>
									<FormControl>
										<div className="w-fit">
											<Switch
												checked={field.value === 1}
												onChange={(value) => field.onChange(value === true ? 1 : 0)}
											/>
										</div>
									</FormControl>
								</FormItem>
							)}
						/>
					</div>
				</Form>
			</Modal>
		</>
	);
};

export default MenuNewModal;
