import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import TreeSelectInput from "@/ui/tree-select-input";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { Menu, MenuTree } from "#/entity";

export type MenuModalProps = {
	formValue: Menu;
	treeRawData: Menu[];
	title: string;
	show: boolean;
	isCreateSub: boolean;
	onOk: (values: Menu) => void;
	onCancel: VoidFunction;
};

export default function UserModal({
	title,
	show,
	isCreateSub,
	formValue,
	onOk,
	onCancel,
	treeRawData,
}: MenuModalProps) {
	const [selectedKey, setSelectedKey] = useState<number>(0);
	const [treeData, setTreeData] = useState<MenuTree[]>([]);
	const form = useForm<Menu>({
		defaultValues: formValue,
	});
	const onSubmit = () => {
		const values = form.getValues();
		onOk(values);
	};

	useEffect(() => {
		form.reset(formValue);
		if (formValue.parent_id) {
			setSelectedKey(formValue.parent_id);
		}
		setTreeData([
			{
				value: "0",
				title: "根节点",
				key: "0",
				path: [0],
				children: buildTree(treeRawData),
			},
		]);
	}, [formValue, form, treeRawData]);

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

	const handleClose = () => {
		setSelectedKey(0); // 清除选中状态
		onCancel(); // 关闭弹框
	};

	return (
		<Dialog open={show} onOpenChange={(open) => !open && handleClose()}>
			<DialogContent className="sm:max-w-5xl">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<div className="grid grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="component"
							render={({ field }) => (
								<FormItem>
									<FormLabel>文件路径</FormLabel>
									<FormControl>
										<Input {...field} />
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
										<Select
											onValueChange={(value) => {
												field.onChange(value);
											}}
											value={String(field.value)}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select Status" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="1">
													<Badge variant="success">是</Badge>
												</SelectItem>
												<SelectItem value="0">
													<Badge variant="error">否</Badge>
												</SelectItem>
											</SelectContent>
										</Select>
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
										<TreeSelectInput
											treeData={treeData}
											disabled={isCreateSub}
											value={String(selectedKey)}
											onChange={(value: string) => {
												field.onChange(value);
											}}
											placeholder="请选择父级角色"
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
										<Input {...field} />
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
										<Input {...field} />
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
										<Select
											onValueChange={(value) => {
												field.onChange(value);
											}}
											value={String(field.value)}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select " />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="1">
													<Badge variant="success">是</Badge>
												</SelectItem>
												<SelectItem value="0">
													<Badge variant="error">否</Badge>
												</SelectItem>
											</SelectContent>
										</Select>
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
										<Select
											onValueChange={(value) => {
												field.onChange(value);
											}}
											value={String(field.value)}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select " />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="1">
													<Badge variant="success">是</Badge>
												</SelectItem>
												<SelectItem value="0">
													<Badge variant="error">否</Badge>
												</SelectItem>
											</SelectContent>
										</Select>
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
										<Select
											onValueChange={(value) => {
												field.onChange(value);
											}}
											value={String(field.value)}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select " />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="1">
													<Badge variant="success">是</Badge>
												</SelectItem>
												<SelectItem value="0">
													<Badge variant="error">否</Badge>
												</SelectItem>
											</SelectContent>
										</Select>
									</FormControl>
								</FormItem>
							)}
						/>
					</div>

					<DialogFooter>
						<Button variant="outline" type="button" onClick={handleClose}>
							Cancel
						</Button>
						<Button type="submit" variant="default" onClick={onSubmit}>
							Confirm
						</Button>
					</DialogFooter>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
