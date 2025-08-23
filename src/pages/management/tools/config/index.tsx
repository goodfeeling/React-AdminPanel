import { useConfigQuery } from "@/store/configManageStore";
import type { Config } from "@/types/entity";
import { Button, Card, Form, Input, InputNumber, Switch, Tabs } from "antd";

const SubBox: React.FC<{ items: Config[] }> = ({ items }) => {
	const [form] = Form.useForm();

	const renderConfigItem = (config: Config) => {
		const formItemProps = {
			label: config.config_key,
			name: config.config_key,
			key: config.config_key,
			help: config.description,
			initialValue: config.config_value,
		};

		switch (config.config_type) {
			case "string":
				return (
					<Form.Item {...formItemProps}>
						<Input />
					</Form.Item>
				);
			case "number":
				return (
					<Form.Item {...formItemProps}>
						<InputNumber style={{ width: "100%" }} />
					</Form.Item>
				);
			case "boolean":
				return (
					<Form.Item {...formItemProps} valuePropName="checked" initialValue={config.config_value === "true"}>
						<Switch />
					</Form.Item>
				);
			case "json":
			case "array":
				return (
					<Form.Item {...formItemProps}>
						<Input.TextArea rows={4} />
					</Form.Item>
				);
			default:
				return (
					<Form.Item {...formItemProps}>
						<Input />
					</Form.Item>
				);
		}
	};

	return (
		<Form form={form} layout="vertical">
			{items.map((item) => renderConfigItem(item))}
			<Form.Item>
				<Button type="primary" htmlType="submit">
					提交
				</Button>
			</Form.Item>
		</Form>
	);
};

const App: React.FC = () => {
	// const updateOrCreateMutation = useUpdateOrCreateConfigMutation();
	const { data, isLoading } = useConfigQuery();
	return (
		<div>
			<Card>
				<Tabs
					defaultActiveKey="1"
					tabPosition={"top"}
					style={{ height: 220 }}
					items={
						!isLoading && data
							? data?.map((item) => {
									return {
										label: item.name,
										key: item.name,
										children: <SubBox items={item.configs} />,
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
