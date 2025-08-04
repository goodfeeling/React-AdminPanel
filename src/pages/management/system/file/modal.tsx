import type { FileInfo } from "@/types/entity";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/ui/form";
import { Input } from "@/ui/input";
import { Button, Modal } from "antd";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export type FileModalProps = {
	formValue: FileInfo;
	title: string;
	show: boolean;
	onOk: (values: FileInfo) => Promise<boolean>;
	onCancel: VoidFunction;
};

const FileNewModal = ({ title, show, formValue, onOk, onCancel }: FileModalProps) => {
	const [loading, setLoading] = useState(false);
	const [open, setOpen] = useState(false);

	const form = useForm<FileInfo>({
		defaultValues: formValue,
	});

	useEffect(() => {
		setOpen(show);
	}, [show]);

	useEffect(() => {
		form.reset(formValue);
	}, [formValue, form]);

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
							name="storage_engine"
							render={({ field }) => (
								<FormItem>
									<FormLabel>storageEngine</FormLabel>
									<FormControl>
										<Input {...field} />
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

export default FileNewModal;
