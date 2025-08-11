import useLangTree from "@/hooks/langTree";
import { BasicStatus } from "@/types/enum";
import { Button } from "@/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/ui/form";
import { Input } from "@/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/ui/toggle-group";
import { Modal, TreeSelect } from "antd";
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
	const langTree = useLangTree(i18n.store.data[i18n.language].translation);
	useEffect(() => {
		setOpen(show);
	}, [show]);

	useEffect(() => {
		form.reset(formValue);
	}, [formValue, form]);

	const onSubmit = (values: MenuGroup) => {
		onOk(values);
	};

	const handleOk = async () => {
		const values = form.getValues();
		await onOk(values);
	};
	const handleCancel = () => {
		setOpen(false);
		onCancel();
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
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Name</FormLabel>
								<FormControl>
									<TreeSelect
										showSearch
										value={field.value}
										styles={{
											popup: { root: { maxHeight: 400, overflow: "auto" } },
										}}
										placeholder="Please select"
										allowClear
										onChange={(value) => {
											field.onChange(value);
										}}
										treeData={langTree}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="path"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Path</FormLabel>
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
