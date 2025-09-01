import UploadTool from "@/components/upload/upload-multiple";
import { useConfigQuery, useUpdateOrCreateConfigMutation } from "@/store/configManageStore";
import { useSystemConfig } from "@/store/configSystemStore";
import type { Config } from "@/types/entity";
import { Card, Form, Input, InputNumber, Select, Switch, Tabs } from "antd";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

type SubBoxProps = {
	items: Config[];
	module: string;
	fileStorageEngine?: string;
};

const SubBox: React.FC<SubBoxProps> = ({ items, module, fileStorageEngine }) => {
	const [form] = Form.useForm();
	const changedValuesRef = useRef<{ [key: string]: any }>({});
	const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const { t } = useTranslation();
	const updateOrCreateMutation = useUpdateOrCreateConfigMutation();

	// 当 items 变化时，设置表单初始值
	useEffect(() => {
		const initialValues: Record<string, any> = {};
		for (const item of items) {
			initialValues[item.config_key] = item.config_value;
		}
		form.setFieldsValue(initialValues);
	}, [items, form]);

	// 处理表单值变化
	const handleValuesChange = (changedValues: any, allValues: any) => {
		// 合并变化的值
		changedValuesRef.current = {
			...changedValuesRef.current,
			...changedValues,
		};

		// 清除之前的定时器
		if (saveTimeoutRef.current) {
			clearTimeout(saveTimeoutRef.current);
		}

		// 设置新的保存定时器
		saveTimeoutRef.current = setTimeout(() => {
			saveFormData(changedValuesRef.current, allValues);
			changedValuesRef.current = {}; // 清空已保存的值
		}, 1000);
	};

	const saveFormData = async (changedValues: any, allValues: any) => {
		try {
			console.log("保存变化的字段:", changedValues);
			console.log("所有字段值:", allValues);
			// 在这里处理表单提交逻辑
			updateOrCreateMutation.mutate({ data: allValues, module });
			// 调用 API 保存数据
			// await api.saveConfig(changedValues);
		} catch (error) {
			console.error("保存失败:", error);
		}
	};

	// 清理定时器
	useEffect(() => {
		return () => {
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current);
			}
		};
	}, []);

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
						<UploadTool
							onHandleSuccess={(result) => {
								if (result.url) {
									form.setFieldValue(config.config_key, result.url);
									handleValuesChange(
										{ [config.config_key]: result.url },
										{
											...form.getFieldsValue(),
											[config.config_key]: result.url,
										},
									);
								}
							}}
							listType="text"
							renderType="image"
							showUploadList={false}
							renderImageUrl={config.config_value}
							uploadType={fileStorageEngine}
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

	return (
		<Form
			form={form}
			layout="horizontal"
			labelAlign="right"
			labelCol={{ span: 6 }}
			wrapperCol={{ span: 18 }}
			onValuesChange={handleValuesChange}
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
		</Form>
	);
};

const App: React.FC = () => {
	const { data, isLoading } = useConfigQuery();
	const { t } = useTranslation();
	const systemStorageEngine = useSystemConfig();
	return (
		<div>
			<Card>
				<Tabs
					defaultActiveKey="1"
					tabPosition={"top"}
					items={
						!isLoading && data
							? data?.map((item) => {
									return {
										label: t(`sys.config.${item.name}`),
										key: item.name,
										children: (
											<SubBox
												items={item.configs}
												module={item.name}
												fileStorageEngine={systemStorageEngine.get("file_storage_engine")}
											/>
										),
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
