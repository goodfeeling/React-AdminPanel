import { Form, FormControl, FormField, FormItem, FormLabel } from "@/ui/form";

import useDictionaryByType from "@/hooks/dict";
import AdvancedCronField from "@/pages/components/cron";
import { Button, Input, Modal, Select } from "antd";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { ScheduledTask } from "#/entity";

export type ScheduledTaskModalProps = {
	formValue: ScheduledTask;
	title: string;
	show: boolean;
	onOk: (values: ScheduledTask) => Promise<boolean>;
	onCancel: VoidFunction;
};

export default function ScheduledTaskModal({ title, show, formValue, onOk, onCancel }: ScheduledTaskModalProps) {
	const statusType = useDictionaryByType("status");
	const taskTypes = useDictionaryByType("task_type");
	const form = useForm<ScheduledTask>({
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
						name="task_name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>task_name</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="task_description"
						render={({ field }) => (
							<FormItem>
								<FormLabel>task_description</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
							</FormItem>
						)}
					/>
					<AdvancedCronField />
					<FormField
						control={form.control}
						name="task_type"
						render={({ field }) => (
							<FormItem>
								<FormLabel>task_type</FormLabel>
								<FormControl>
									<Select
										style={{ width: 150 }}
										onChange={(value: string) => {
											field.onChange(value);
										}}
										value={String(field.value)}
										options={taskTypes}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="task_params"
						render={({ field }) => (
							<FormItem>
								<FormLabel>task_params</FormLabel>
								<FormControl>
									{
										<Input.TextArea
											rows={4}
											onChange={(e) => field.onChange(e.target.value)}
											value={JSON.stringify(field.value)}
										/>
									}
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="status"
						render={({ field }) => (
							<FormItem>
								<FormLabel>status</FormLabel>
								<FormControl>
									<Select
										style={{ width: 120 }}
										onChange={(value: string) => {
											field.onChange(value);
										}}
										value={String(field.value)}
										options={statusType}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
				</form>
			</Form>
		</Modal>
	);
}
