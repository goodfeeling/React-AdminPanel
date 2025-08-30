import { UploadApi } from "@/api/services/uploadService";
import { Upload } from "@/components/upload";
import { useConfigQuery, useUpdateOrCreateConfigMutation } from "@/store/configManageStore";
import useUserStore from "@/store/userStore";
import type { Config } from "@/types/entity";
import { Button, Card, Form, Input, InputNumber, Select, Switch, Tabs } from "antd";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const SubBox: React.FC<{ items: Config[]; module: string }> = ({ items, module }) => {
	const [form] = Form.useForm();
	const { t } = useTranslation();
	const { userToken } = useUserStore.getState();
	const updateOrCreateMutation = useUpdateOrCreateConfigMutation();

	// 当 items 变化时，设置表单初始值
	useEffect(() => {
		const initialValues: Record<string, any> = {};
		for (const item of items) {
			initialValues[item.config_key] = item.config_value;
		}
		form.setFieldsValue(initialValues);
	}, [items, form]);

	const renderConfigItem = (config: Config) => {
		switch (config.config_type) {
			case "string":
				return (
					<Form.Item
						label={t(`sys.config.${config.config_key}`)}
						name={config.config_key}
						initialValue={config.config_value}
						key={config.config_key}
						rules={[{ required: true, message: `Please input ${config.config_key}` }]}
					>
						<Input />
					</Form.Item>
				);
			case "number":
				return (
					<Form.Item
						label={t(`sys.config.${config.config_key}`)}
						name={config.config_key}
						initialValue={config.config_value}
						key={config.config_key}
						rules={[{ required: true, message: `Please input ${config.config_key}` }]}
					>
						<InputNumber style={{ width: "100%" }} />
					</Form.Item>
				);
			case "select":
				return (
					<Form.Item
						label={t(`sys.config.${config.config_key}`)}
						name={config.config_key}
						initialValue={config.config_value}
						key={config.config_key}
						rules={[{ required: true, message: `Please Select ${config.config_key}` }]}
					>
						<Select style={{ width: 150 }} options={config.select_options} />
					</Form.Item>
				);
			case "boolean":
				return (
					<Form.Item
						label={t(`sys.config.${config.config_key}`)}
						name={config.config_key}
						valuePropName="checked"
						initialValue={config.config_value === "true"}
						key={config.config_key}
						rules={[{ required: true, message: `Please Select ${config.config_key}` }]}
					>
						<Switch />
					</Form.Item>
				);
			case "image":
				return (
					<Form.Item
						label={t(`sys.config.${config.config_key}`)}
						name={config.config_key}
						initialValue={config.config_value}
						key={config.config_key}
						rules={[{ required: true, message: `Please Upload ${config.config_key}` }]}
					>
						<Upload
							maxCount={1}
							fileList={[
								{
									uid: "-1",
									name: "image.png",
									status: "done",
									url: config.config_value,
								},
							]}
							name="file"
							action={`${import.meta.env.VITE_APP_BASE_API}${UploadApi.Single}`}
							headers={{
								Authorization: `Bearer ${userToken?.accessToken}`,
							}}
							onChange={(info) => {
								const { file } = info;

								// 检查文件是否上传成功
								if (file.status === "done" && file.response) {
									// 假设服务器返回的文件URL在 file.response.url 中
									const fileUrl = file.response.data.file_url || "";
									form.setFieldValue(config.config_key, fileUrl);
								} else if (file.status === "removed") {
									// 文件被移除时更新状态
									form.setFieldValue(config.config_key, "");
								} else if (file.status === "error") {
								} else {
									// 上传过程中更新文件列表
								}
							}}
						/>
					</Form.Item>
				);
			case "json":
			case "array":
				return (
					<Form.Item
						label={t(`sys.config.${config.config_key}`)}
						name={config.config_key}
						initialValue={config.config_value}
						key={config.config_key}
					>
						<Input.TextArea rows={4} />
					</Form.Item>
				);
			default:
				return (
					<Form.Item
						label={t(`sys.config.${config.config_key}`)}
						name={config.config_key}
						initialValue={config.config_value}
						key={config.config_key}
					>
						<Input />
					</Form.Item>
				);
		}
	};
	// 处理表单提交
	const onFinish = (values: any) => {
		console.log("表单提交数据:", values);
		// 在这里处理表单提交逻辑
		updateOrCreateMutation.mutate(
			{ data: values, module },
			{
				onSuccess: () => {
					toast.success("success!");
				},
			},
		);
	};
	return (
		<Form
			form={form}
			layout="horizontal"
			labelAlign="right"
			onFinish={onFinish}
			labelCol={{ span: 6 }}
			wrapperCol={{ span: 18 }}
			style={{
				flex: 1,
				display: "flex",
				flexDirection: "column",
				maxWidth: "800px",
				width: "100%",
				padding: "20px",
			}}
		>
			{items.map((item) => renderConfigItem(item))}
			<Form.Item wrapperCol={{ offset: 6, span: 16 }} style={{ marginTop: "20px", textAlign: "right" }}>
				<Button type="primary" htmlType="submit">
					{t("sys.config.save")}
				</Button>
			</Form.Item>
		</Form>
	);
};

const App: React.FC = () => {
	const { data, isLoading } = useConfigQuery();
	const { t } = useTranslation();
	return (
		<div>
			<Card title={t("sys.menu.system.setting")} size="small">
				<Tabs
					defaultActiveKey="1"
					tabPosition={"top"}
					items={
						!isLoading && data
							? data?.map((item) => {
									return {
										label: t(`sys.config.${item.name}`),
										key: item.name,
										children: <SubBox items={item.configs} module={item.name} />,
									};
								})
							: []
					}
				/>
			</Card>
		</div>
	);
};

export default App;
