import useLangTree from "@/hooks/langTree";
import { BasicStatus } from "@/types/enum";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/ui/toggle-group";
import { Button, Cascader, Modal } from "antd";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { MenuGroup } from "#/entity";

export type MenuGroupModalProps = {
	formValue: MenuGroup;
	title: string;
	show: boolean;
	onOk: (values: MenuGroup) => void;
	onCancel: VoidFunction;
};

export default function UserModal({ title, show, formValue, onOk, onCancel }: MenuGroupModalProps) {
	const { i18n } = useTranslation();
	const form = useForm<MenuGroup>({
		defaultValues: formValue,
	});
	const [open, setOpen] = useState(false);
	const [isManualTitleInput, setIsManualTitleInput] = useState(true);
	const langTree = useLangTree(i18n.store.data[i18n.language].translation);
	useEffect(() => {
		setOpen(show);
	}, [show]);

	useEffect(() => {
		form.reset(formValue);
	}, [formValue, form]);

	const handleOk = async () => {
		form.handleSubmit(async (values) => {
			await onOk(values);
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
		<Modal
			width={400}
			open={open}
			title={title}
			onOk={handleOk}
			onCancel={handleCancel}
			centered
			footer={[
				<Button key="back" onClick={handleCancel}>
					Return
				</Button>,
				<Button key="submit" onClick={handleOk}>
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
								<FormLabel className="flex items-center justify-between">
									<span>Name</span>
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
						name="path"
						rules={{ required: "path is required" }}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Path</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="sort"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Sort</FormLabel>
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
	);
}
