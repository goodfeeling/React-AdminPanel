import { UploadApi } from "@/api/services/uploadService";
import { useOssUpload } from "@/hooks/ossUpload";
import { useSTSTokenLoading } from "@/store/stsTokenStore";
import useUserStore from "@/store/userStore";
import type { DictionaryDetail, FileInfo } from "@/types/entity";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/ui/form";
import { InboxOutlined } from "@ant-design/icons";
import { Modal, Select } from "antd";
import type { UploadProps } from "antd";
import { Upload } from "antd";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const { Dragger } = Upload;

export type FileModalProps = {
	formValue: FileInfo;
	title: string;
	storageEngine: DictionaryDetail[] | undefined;
	show: boolean;
	onOk: (values: FileInfo | null) => Promise<boolean>;
	onCancel: VoidFunction;
};
const parseUriFromUrl = (fileUrl: string): string => {
	try {
		const url = new URL(fileUrl);
		return url.pathname.startsWith("/") ? url.pathname.substring(1) : url.pathname;
	} catch (error) {
		// 如果不是有效的URL，返回原始字符串或处理错误
		console.error("Invalid URL:", error);
		return fileUrl;
	}
};
const FileNewModal = ({ title, show, formValue, storageEngine, onOk, onCancel }: FileModalProps) => {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const { uploadFile } = useOssUpload();
	const isOssLoading = useSTSTokenLoading();
	const [selectedStorageEngine, setSelectedStorageEngine] = useState<string>("local");

	const { userToken } = useUserStore.getState();
	const form = useForm<FileInfo>({
		defaultValues: formValue,
	});

	useEffect(() => {
		setOpen(show);
	}, [show]);

	useEffect(() => {
		form.reset(formValue);
	}, [formValue, form]);

	const handleCancel = () => {
		setOpen(false);
		onCancel();
	};
	// 处理文件上传的函数
	const handleFileUpload = async (file: File) => {
		if (selectedStorageEngine === "aliyunoss") {
			// 使用阿里云OSS上传
			const result = await uploadFile(file);
			if (result.success) {
				// 上传成功后更新表单数据
				form.setValue("file_url", result.url ?? "");
				form.setValue("file_name", result.name ?? "");
				form.setValue("file_origin_name", file.name);
				if (result.url) {
					const uri = parseUriFromUrl(result.url);
					form.setValue("file_path", uri);
				}
				onOk(form.getValues());
				toast.success(`${file.name} ${t("table.handle_message.upload_success")}`);
			} else {
				toast.error(`${file.name} ${t("table.handle_message.upload_error")}`);
			}
			return false;
		}
		return true;
	};

	const props: UploadProps = {
		name: "file",
		multiple: true,
		action: `${import.meta.env.VITE_APP_BASE_API}${UploadApi.Multiple}`,
		headers: {
			Authorization: `Bearer ${userToken?.accessToken}`,
		},
		onChange(info) {
			const { status } = info.file;
			switch (status) {
				case "uploading":
					console.log(info.file, info.fileList);
					break;
				case "done":
					toast.success(`${info.file.name} ${t("table.handle_message.upload_success")}`);
					onOk(null);
					break;
				case "error":
					toast.error(`${info.file.name} ${t("table.handle_message.upload_error")}`);

					break;
				default:
					console.log(info);
			}
		},
		onDrop(e) {
			console.log("Dropped files", e.dataTransfer.files);
		},
		// 根据存储引擎类型决定是否使用自定义上传
		beforeUpload: (file) => {
			handleFileUpload(file);
			// 如果是OSS上传，阻止默认上传行为
			return selectedStorageEngine === "local";
		},
		// 禁用默认上传行为当使用OSS时
		disabled: !isOssLoading,
	};

	return (
		<>
			<Modal open={open} title={title} onCancel={handleCancel} centered footer={false}>
				<Form {...form}>
					<form className="space-y-4">
						<FormField
							control={form.control}
							name="storage_engine"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("table.columns.file.file_origin_name")}</FormLabel>
									<FormControl>
										<Select
											defaultValue="local"
											style={{ width: 120 }}
											onChange={(value: string) => {
												field.onChange(value);
												setSelectedStorageEngine(value);
											}}
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
