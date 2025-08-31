import { UploadApi } from "@/api/services/uploadService";
import { useOssUpload } from "@/hooks/ossUpload";
import { useRemoveFileInfoMutation } from "@/store/fileManageStore";
import { useSTSTokenLoading } from "@/store/stsTokenStore";
import useUserStore from "@/store/userStore";
import { LoadingOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import { App, Button, Upload } from "antd";
import type { UploadListType } from "antd/es/upload/interface";
import type { UploadFile } from "antd/lib";
import type React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface UploadToolProps {
	uploadType?: string;
	onHandleSuccess?: (fileList: any) => void;
	listType: UploadListType | undefined;
	fileList?: UploadFile<any>[] | undefined;
	showUploadList?: boolean;
	renderType: "button" | "image";
	renderImageUrl: string;
}

const UploadTool: React.FC<Readonly<UploadToolProps>> = ({
	uploadType,
	onHandleSuccess,
	listType,
	showUploadList,
	fileList,
	renderType,
	renderImageUrl,
}) => {
	const { t } = useTranslation();
	const { message } = App.useApp();
	const { userToken } = useUserStore.getState();
	const { uploadFile } = useOssUpload();
	const isOssLoading = useSTSTokenLoading();
	const removeMutation = useRemoveFileInfoMutation();
	const [imageUrl, setImageUrl] = useState<string>();
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setImageUrl(renderImageUrl);
	}, [renderImageUrl]);

	const props: UploadProps = {
		name: "file",
		listType: listType,
		showUploadList: showUploadList,
		defaultFileList: fileList,
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
					message.success(`${info.file.name} ${t("table.handle_message.upload_success")}`);
					if (onHandleSuccess) {
						onHandleSuccess(null);
					}
					setImageUrl(info.file.response.data[0].file_url);
					break;
				case "error":
					message.error(`${info.file.name} ${t("table.handle_message.upload_error")}`);

					break;
				default:
					console.log(info);
			}
		},
		// 根据存储引擎类型决定是否使用自定义上传
		beforeUpload: async (file) => {
			if (uploadType === "aliyunoss") {
				setLoading(true);
				// 使用阿里云OSS上传
				const result = await uploadFile(file);
				setLoading(false);
				if (result.success) {
					// 上传成功后更新表单数据

					setImageUrl(result.url);
					if (onHandleSuccess) {
						onHandleSuccess(result);
					}
					message.success(`${file.name} ${t("table.handle_message.upload_success")}`);
				} else {
					message.error(`${file.name} ${t("table.handle_message.upload_error")}`);
				}
				return false;
			}
			return true;
		},
		onRemove: async (file) => {
			removeMutation.mutate(file.response.data[0].id, {
				onSuccess: () => {
					message.success(t("table.handle_message.delete_success"));
				},
				onError: () => {
					message.error(t("table.handle_message.error"));
				},
			});
		},
		// 禁用默认上传行为当使用OSS时
		disabled: !isOssLoading,
	};

	const render = () => {
		if (renderType === "button") {
			return <Button icon={<UploadOutlined />}>Click to Upload</Button>;
		}
		return imageUrl ? (
			<img
				src={imageUrl}
				alt="avatar"
				style={{
					width: "30%",
					height: "auto",
					objectFit: "cover",
					borderRadius: "8px",
					boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
					transition: "all 0.3s ease",
				}}
				onMouseEnter={(e) => {
					e.currentTarget.style.transform = "scale(1.05)";
					e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.15)";
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.transform = "scale(1)";
					e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
				}}
			/>
		) : (
			<button style={{ border: 0, background: "none" }} type="button">
				{loading ? <LoadingOutlined /> : <PlusOutlined />}
				<div style={{ marginTop: 8 }}>Upload</div>
			</button>
		);
	};

	return <Upload {...props}>{render()}</Upload>;
};

export default UploadTool;
