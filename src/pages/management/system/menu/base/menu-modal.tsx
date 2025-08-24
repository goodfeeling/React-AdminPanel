import type { Menu, MenuTree } from "@/types/entity";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { IconPicker } from "@/ui/icon-picker";
import { Input } from "@/ui/input";

import useDirTree from "@/hooks/dirTree";
import useLangTree from "@/hooks/langTree";
import { Button, Cascader, Modal, Switch, TreeSelect } from "antd";
import type { TFunction } from "i18next";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
export type MenuModalProps = {
	formValue: Menu;
	treeRawData: Menu[];
	title: string;
	show: boolean;
	onOk: (values: Menu) => Promise<boolean>;
	onCancel: VoidFunction;
};
// 构建树形结构
export const buildTree = (tree: Menu[], t: TFunction<"translation", undefined>, disabledId?: string): MenuTree[] => {
	return tree.map((item: Menu): MenuTree => {
		return {
			value: item.id.toString(),
			title: t(item.title),
			key: item.id.toString(),
			path: item.level,
			origin: item,
			disabled: item.id.toString() === disabledId,
			children: item.children ? buildTree(item.children, t) : [],
		};
	});
};
const MenuNewModal = ({ title, show, treeRawData, formValue, onOk, onCancel }: MenuModalProps) => {
	const { t, i18n } = useTranslation();

	const [loading, setLoading] = useState(false);
	const [open, setOpen] = useState(false);
	const [treeData, setTreeData] = useState<MenuTree[]>([]);
	const dirTree = useDirTree();
	const [isManualInput, setIsManualInput] = useState(true);
	const [isManualTitleInput, setIsManualTitleInput] = useState(true);
	const langTree = useLangTree(i18n.store.data[i18n.language].translation);
	const form = useForm<Menu>({
		defaultValues: formValue,
	});
	console.log(langTree);

	useEffect(() => {
		setOpen(show);
	}, [show]);

	useEffect(() => {
		form.reset(formValue);
		const currentId = formValue.id.toString();
		setTreeData([
			{
				value: "0",
				title: "根节点",
				key: "0",
				path: [0],
				children: buildTree(treeRawData, t, currentId),
			},
		]);
	}, [formValue, treeRawData, form, t]);

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

	const handleValue = (value: any) => {
		if (Array.isArray(value)) {
			return value;
		}
		if (typeof value === "string") {
			return value.split("/");
		}
		return undefined;
	};

	return (
		<>
			<Modal
				width={600}
				open={open}
				title={title}
				onOk={handleOk}
				styles={{
					body: {
						maxHeight: "80vh",
						overflowY: "auto",
					},
				}}
				classNames={{
					body: "themed-scrollbar",
				}}
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
							name="component"
							rules={{ required: "component is required" }}
							render={({ field }) => (
								<FormItem>
									<FormLabel className="flex items-center justify-between">
										<span>文件路径</span>
										<Button
											type="link"
											size="small"
											onClick={() => {
												setIsManualInput(!isManualInput);
												// 切换模式时清空字段值
												field.onChange(undefined);
											}}
										>
											{isManualInput ? "切换到便捷选择" : "切换到手动输入"}
										</Button>
									</FormLabel>
									<FormControl>
										{isManualInput ? (
											<Input
												{...field}
												placeholder="请输入文件路径，如: /dashboard/workplace"
												value={field.value || ""}
											/>
										) : (
											<div className="flex gap-2">
												<Cascader
													style={{ flex: 1 }}
													fieldNames={{
														label: "title",
														children: "children",
													}}
													value={handleValue(field.value)}
													options={dirTree}
													onChange={(value) => {
														// 将数组形式的路径值转换为字符串
														if (Array.isArray(value)) {
															field.onChange(value[value.length - 1]);
														} else {
															field.onChange(value);
														}
													}}
													placeholder="请选择文件路径"
													popupMenuColumnStyle={{
														width: "200px",
														whiteSpace: "normal",
													}}
													showSearch
												/>
											</div>
										)}
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="title"
							rules={{ required: "title is required" }}
							render={({ field }) => (
								<FormItem>
									<FormLabel className="flex items-center justify-between">
										<span>展示名称</span>
										<Button
											type="link"
											size="small"
											onClick={() => {
												setIsManualTitleInput(!isManualTitleInput);
												// 切换模式时清空字段值
												field.onChange(undefined);
											}}
										>
											{isManualTitleInput ? "切换到便捷选择" : "切换到手动输入"}
										</Button>
									</FormLabel>
									<FormControl>
										{isManualTitleInput ? (
											<Input {...field} placeholder="请输入展示名称，如: 菜单管理" value={field.value || ""} />
										) : (
											<div className="flex gap-2">
												<Cascader
													style={{ flex: 1 }}
													value={handleValue(field.value)}
													options={langTree}
													onChange={(value) => {
														// 将数组形式的路径值转换为字符串
														if (Array.isArray(value)) {
															field.onChange(value[value.length - 1]);
														} else {
															field.onChange(value);
														}
													}}
													placeholder="请选择文件路径"
													popupMenuColumnStyle={{
														width: "200px",
														whiteSpace: "normal",
													}}
													showSearch
												/>
											</div>
										)}
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="name"
							rules={{ required: "name is required" }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>路由Name</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="path"
							rules={{ required: "path is required" }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>路由Path</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
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
							name="parent_id"
							rules={{ required: "parent_id is required" }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>父节点ID</FormLabel>
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
											onChange={(value) => {
												field.onChange(Number(value));
											}}
											treeData={treeData}
										/>
									</FormControl>
									<FormMessage />
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
					</form>
				</Form>
			</Modal>
		</>
	);
};

export default MenuNewModal;
