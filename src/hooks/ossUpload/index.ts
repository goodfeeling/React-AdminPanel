import uploadService from "@/api/services/uploadService";
import type { STSToken } from "@/types/entity";
import { useMutation } from "@tanstack/react-query";
import OSS from "ali-oss";

export const useOssUpload = () => {
	const getSTSTokenMutation = useMutation({
		mutationFn: () => uploadService.GetSTSToken(),
	});

	const uploadToOSS = async (file: File, customName?: string) => {
		try {
			// 获取 STS Token
			const stsToken: STSToken = await getSTSTokenMutation.mutateAsync();

			// 配置 OSS 客户端
			const client = new OSS({
				region: stsToken.region,
				accessKeyId: stsToken.access_key_id,
				accessKeySecret: stsToken.access_key_secret,
				stsToken: stsToken.security_token,
				bucket: stsToken.bucket_name,
			});

			// 生成文件名
			const fileName = customName || `${Date.now()}-${file.name}`;

			// 上传文件
			const result = await client.put(fileName, file, {
				// 添加进度回调
				progress: (p: any) => {
					console.log("上传进度:", p);
				},
			});

			return {
				success: true,
				url: result.url,
				name: fileName,
			};
		} catch (error: any) {
			console.error("OSS上传失败:", error);

			// 提供更详细的错误信息
			let errorMessage = "未知错误";

			// 检查是否是CORS错误
			if (error.code === "RequestError" && error.status === -1) {
				errorMessage = "CORS配置错误或网络连接问题，请检查OSS的跨域设置";
			} else if (error.code) {
				switch (error.code) {
					case "AccessDenied":
						errorMessage = "访问被拒绝，请检查STS Token权限";
						break;
					case "NoSuchBucket":
						errorMessage = "Bucket不存在，请检查配置";
						break;
					default:
						errorMessage = error.message || error.code;
				}
			} else if (error.message) {
				errorMessage = error.message;
			}

			return {
				success: false,
				error: errorMessage,
			};
		}
	};

	return {
		uploadToOSS,
		isLoading: getSTSTokenMutation.isPending,
	};
};
