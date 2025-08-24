import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";

import { ToggleGroup, ToggleGroupItem } from "@/ui/toggle-group";
import { Button, Modal, Switch } from "antd";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { Dictionary } from "#/entity";

export type DictionaryModalProps = {
	formValue: Dictionary;
	title: string;
	show: boolean;
	onOk: (values: Dictionary) => Promise<boolean>;
	onCancel: VoidFunction;
};

export default function UserModal({ title, show, formValue, onOk, onCancel }: DictionaryModalProps) {
	const form = useForm<Dictionary>({
		defaultValues: formValue,
	});
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	useEffect(() => {
		form.reset(formValue);
	}, [formValue, form]);

	useEffect(() => {
		setOpen(show);
	}, [show]);

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
		<Modal
			open={open}
			title={title}
			onOk={handleOk}
			onCancel={handleCancel}
			styles={{
				body: {
					maxHeight: "80vh",
					overflowY: "auto",
				},
			}}
			classNames={{
				body: "themed-scrollbar",
			}}
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
								<FormLabel>name</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="type"
						rules={{ required: "type is required" }}
						render={({ field }) => (
							<FormItem>
								<FormLabel>type</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="is_generate_file"
						render={({ field }) => (
							<FormItem>
								<FormLabel>isGenerateFile</FormLabel>
								<FormControl>
									<div className="w-fit">
										<Switch checked={Boolean(field.value)} onChange={(value) => field.onChange(Number(value))} />
									</div>
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
											field.onChange(Number(value));
										}}
									>
										<ToggleGroupItem value="1">Enable</ToggleGroupItem>
										<ToggleGroupItem value="2">Disable</ToggleGroupItem>
									</ToggleGroup>
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="desc"
						render={({ field }) => (
							<FormItem>
								<FormLabel>desc</FormLabel>
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
