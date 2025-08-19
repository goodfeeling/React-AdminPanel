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
	const taskTypes = useDictionaryByType("task_type");
	const apiMethod = useDictionaryByType("api_method");
	const form = useForm<ScheduledTask>({
		defaultValues: formValue,
	});
	const [loading, setLoading] = useState(false);
	const [open, setOpen] = useState(false);

	const taskType = form.watch("task_type");

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

	// 根据task_type渲染不同的参数输入界面
	const renderTaskParams = () => {
		switch (taskType) {
			case "http_call":
				return (
					<div className="space-y-4">
						<FormField
							control={form.control}
							name="task_params.url"
							render={({ field }) => (
								<FormItem>
									<FormLabel>URL</FormLabel>
									<FormControl>
										<Input {...field} placeholder="http://example.com/api/health" />
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="task_params.method"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Method</FormLabel>
									<FormControl>
										<Select {...field} style={{ width: "100%" }} options={apiMethod} />
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="task_params.timeout"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Timeout (seconds)</FormLabel>
									<FormControl>
										<Input
											type="number"
											{...field}
											value={field.value || ""}
											onChange={(e) => field.onChange(Number(e.target.value))}
											placeholder="30"
										/>
									</FormControl>
								</FormItem>
							)}
						/>
					</div>
				);

			case "function":
				return (
					<div className="space-y-4">
						<FormField
							control={form.control}
							name="task_params.function_name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Function Name</FormLabel>
									<FormControl>
										<Input {...field} placeholder="task function name" />
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="task_params.days_to_keep"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Days to Keep</FormLabel>
									<FormControl>
										<Input
											type="number"
											{...field}
											value={field.value || ""}
											onChange={(e) => field.onChange(Number(e.target.value))}
											placeholder="30"
										/>
									</FormControl>
								</FormItem>
							)}
						/>
					</div>
				);
			// 添加脚本任务类型
			case "script_exec":
				return (
					<div className="space-y-4">
						<FormField
							control={form.control}
							name="task_params.script_path"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Script Path</FormLabel>
									<FormControl>
										<Input {...field} placeholder="/path/to/your/script.sh" />
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="task_params.arguments"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Arguments (optional)</FormLabel>
									<FormControl>
										<Input {...field} placeholder="arg1 arg2 arg3" />
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="task_params.timeout"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Timeout (seconds)</FormLabel>
									<FormControl>
										<Input
											type="number"
											{...field}
											value={field.value || ""}
											onChange={(e) => field.onChange(Number(e.target.value))}
											placeholder="60"
										/>
									</FormControl>
								</FormItem>
							)}
						/>
					</div>
				);
			default:
				return (
					<FormField
						control={form.control}
						name="task_params"
						render={({ field }) => (
							<FormItem>
								<FormLabel>task_params</FormLabel>
								<FormControl>
									<Input.TextArea
										rows={4}
										onChange={(e) => field.onChange(JSON.parse(e.target.value || "{}"))}
										value={JSON.stringify(field.value, null, 2)}
										placeholder='{"key": "value"}'
									/>
								</FormControl>
							</FormItem>
						)}
					/>
				);
		}
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
											// 重置task_params当task_type改变时
											form.setValue("task_params", {});
										}}
										value={String(field.value)}
										options={taskTypes}
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					{renderTaskParams()}
				</form>
			</Form>
		</Modal>
	);
}
