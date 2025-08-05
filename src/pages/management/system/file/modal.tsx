import type { DictionaryDetail, FileInfo } from "@/types/entity";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/ui/form";
import { InboxOutlined } from "@ant-design/icons";
import { Modal, Select } from "antd";
import type { UploadProps } from "antd";
import { Upload, message } from "antd";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
const { Dragger } = Upload;
export type FileModalProps = {
	formValue: FileInfo;
	title: string;
	storageEngine: DictionaryDetail[] | undefined;
	show: boolean;
	onOk: (values: FileInfo) => Promise<boolean>;
	onCancel: VoidFunction;
};

const FileNewModal = ({ title, show, formValue, storageEngine, onOk, onCancel }: FileModalProps) => {
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
	console.log(loading);

	const handleCancel = () => {
		setOpen(false);
		onCancel();
	};

	const props: UploadProps = {
		name: "file",
		multiple: true,
		action: "https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload",
		onChange(info) {
			const { status } = info.file;
			if (status !== "uploading") {
				console.log(info.file, info.fileList);
			}
			if (status === "done") {
				message.success(`${info.file.name} file uploaded successfully.`);
			} else if (status === "error") {
				message.error(`${info.file.name} file upload failed.`);
			}
		},
		onDrop(e) {
			console.log("Dropped files", e.dataTransfer.files);
		},
	};
	console.log(storageEngine);

	return (
		<>
			<Modal open={open} title={title} onOk={handleOk} onCancel={handleCancel} centered footer={false}>
				<Form {...form}>
					<form className="space-y-4">
						<FormField
							control={form.control}
							name="storage_engine"
							render={({ field }) => (
								<FormItem>
									<FormLabel>存储方式</FormLabel>
									<FormControl>
										<Select
											defaultValue="local"
											style={{ width: 120 }}
											onChange={(value: string) => field.onChange(value)}
											options={storageEngine}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<Dragger {...props}>
							<p className="ant-upload-drag-icon">
								<InboxOutlined />
							</p>
							<p className="ant-upload-text">Click or drag file to this area to upload</p>
							<p className="ant-upload-hint">
								Support for a single or bulk upload. Strictly prohibited from uploading company data or other banned
								files.
							</p>
						</Dragger>
					</form>
				</Form>
			</Modal>
		</>
	);
};

export default FileNewModal;
