import { Form, FormControl, FormField, FormItem, FormLabel } from "@/ui/form";
import { Input } from "@/ui/input";

import { Button, Modal, Select } from "antd";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { Api, DictionaryDetail } from "#/entity";

export type ApiModalProps = {
	formValue: Api;
	apiGroup: DictionaryDetail[] | undefined;
	apiMethod: DictionaryDetail[] | undefined;
	title: string;
	show: boolean;
	onOk: (values: Api) => Promise<boolean>;
	onCancel: VoidFunction;
};

export default function ApiModal({ title, show, formValue, apiGroup, apiMethod, onOk, onCancel }: ApiModalProps) {
	const form = useForm<Api>({
		defaultValues: formValue,
	});
	const [loading, setLoading] = useState(false);
	const [open, setOpen] = useState(false);

	useEffect(() => {
		form.reset(formValue);
	}, [formValue, form]);

	useEffect(() => {
		setOpen(show);
	}, [show]);

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
						name="method"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Method</FormLabel>

								<Select
									style={{ width: 150 }}
									onChange={(value: string) => {
										field.onChange(value);
									}}
									value={field.value}
									options={apiMethod}
								/>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="api_group"
						render={({ field }) => (
							<FormItem>
								<FormLabel>ApiGroup</FormLabel>

								<Select
									style={{ width: 150 }}
									onChange={(value: string) => {
										field.onChange(value);
									}}
									value={field.value}
									options={apiGroup}
								/>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="description"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Description</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
							</FormItem>
						)}
					/>
				</form>
			</Form>
		</Modal>
	);
}
