import configService from "@/api/services/configService";
import UploadTool from "@/components/upload/upload-multiple";
import type { ConfigResponse } from "@/types/entity";
import { Button, Card, Form, Input, InputNumber, Switch, Tabs, message } from "antd";
import { useEffect, useState } from "react";

const ConfigTabs = () => {
	const [formData, setFormData] = useState<ConfigResponse>({ data: {} });
	const [loading, setLoading] = useState(false);
	const [form] = Form.useForm();

	useEffect(() => {
		fetchConfigData();
	}, []);

	const fetchConfigData = async () => {
		setLoading(true);
		try {
			const response = await configService.getConfigs();
			setFormData(response);
		} catch (error) {
			console.error("Failed to fetch config data:", error);
			message.error("获取配置数据失败");
		} finally {
			setLoading(false);
		}
	};

	const handleSave = (key: string) => {
		form
			.validateFields()
			.then(async (values) => {
				// 在实际项目中，这里应该调用API保存数据
				try {
					setLoading(true);
					await configService.updateConfig(values, key);
					console.log(`Saving ${key} config:`, values);
					message.success(`${key} 配置已保存`);
					// 更新状态
					setFormData({
						...formData,
						data: {
							...formData.data,
							[key]: values,
						},
					});
				} catch (error) {
					console.error("Save failed:", error);
					message.error("保存配置失败");
				} finally {
					setLoading(false);
				}
			})
			.catch((error) => {
				console.error("Validate Failed:", error);
				message.error("表单验证失败");
			});
	};

	const configKeys = Object.keys(formData.data);

	const render = (key: string, configKey: string, configValue: string) => {
		if (key === "site" && ["logo", "favicon", "login_img"].findIndex((item) => item === configKey) >= 0) {
			return (
				<UploadTool
					onHandleSuccess={(result) => {
						if (result.url) {
							form.setFieldValue(configKey, result.url);
							handleSave(key);
						}
					}}
					listType="text"
					renderType="image"
					showUploadList={false}
					renderImageUrl={configValue}
				/>
			);
		}
		return typeof configValue === "number" ? (
			<InputNumber style={{ width: "100%" }} />
		) : typeof configValue === "boolean" ? (
			<Switch checked={configValue} />
		) : typeof configValue === "object" ? (
			<Input.TextArea rows={4} defaultValue={JSON.stringify(configValue, null, 2)} />
		) : (
			<Input defaultValue={String(configValue)} />
		);
	};

	const items = configKeys.map((key) => {
		const configData = formData.data[key];
		return {
			label: key,
			key: key,
			children: (
				<Form form={form} layout="vertical" initialValues={configData} onFinish={() => handleSave(key)}>
					<div className="p-4">
						<h2 className="text-lg font-semibold mb-4 capitalize">{key} Configuration</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{Object.entries(configData || {}).map(([configKey, configValue]) => (
								<Form.Item
									key={configKey}
									label={configKey}
									name={configKey}
									rules={[{ required: true, message: `请输入 ${configKey}` }]}
								>
									{render(key, configKey, configValue)}
								</Form.Item>
							))}
						</div>
						<div className="flex justify-end mt-6">
							<Button type="primary" onClick={() => handleSave(key)} loading={loading}>
								保存 {key} 配置
							</Button>
						</div>
					</div>
				</Form>
			),
		};
	});

	return (
		<div className="p-6">
			<Card>
				<h1 className="text-2xl font-bold mb-6">系统配置管理</h1>
				<Tabs defaultActiveKey={configKeys[0]} items={items} tabPosition="top" />
			</Card>
		</div>
	);
};

export default ConfigTabs;
