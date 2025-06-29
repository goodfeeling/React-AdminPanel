import { Badge } from "@/ui/badge";
import type { GetProp, TableProps } from "antd";
import { Button, Card, Table } from "antd";
import type { AnyObject } from "antd/es/_util/type";
import type { SorterResult } from "antd/es/table/interface";
import { useEffect, useState } from "react";
import type { PageList, UserInfo } from "#/entity";
type ColumnsType<T extends object = object> = TableProps<T>["columns"];
type TablePaginationConfig = Exclude<GetProp<TableProps, "pagination">, boolean>;
import userService from "@/api/services/userService";
import { CardContent, CardHeader } from "@/ui/card";

interface TableParams {
	pagination?: TablePaginationConfig;
	sortField?: SorterResult<any>["field"];
	sortOrder?: SorterResult<any>["order"];
	filters?: Parameters<GetProp<TableProps, "onChange">>[1];
}

const columns: ColumnsType<UserInfo> = [
	{
		title: "ID",
		dataIndex: "id",
		sorter: true,
		width: "5%",
	},
	{
		title: "用户名",
		dataIndex: "user_name",
		width: 300,
		render: (_, record) => {
			console.log(record);

			return (
				<div className="flex">
					<img alt="" src={record.header_img} className="h-10 w-10 rounded-full" />
					<div className="ml-2 flex flex-col">
						<span className="text-sm">{record.user_name}</span>
						<span className="text-xs text-text-secondary">{record.email}</span>
					</div>
				</div>
			);
		},
	},
	{
		title: "邮箱",
		dataIndex: "email",
	},

	{
		title: "昵称",
		dataIndex: "nick_name",
	},
	{
		title: "手机",
		dataIndex: "phone",
	},
	{
		title: "状态",
		dataIndex: "status",
		align: "center",
		width: 120,
		render: (status) => {
			console.log(status);

			return <Badge variant={status ? "error" : "success"}>{status ? "Disable" : "Enable"}</Badge>;
		},
	},
	{
		title: "创建时间",
		dataIndex: "created_at",
	},
	{
		title: "更新时间",
		dataIndex: "updated_at",
	},
];

const toURLSearchParams = <T extends AnyObject>(record: T) => {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(record)) {
		params.append(key, value);
	}
	return params;
};

const getRandomuserParams = (params: TableParams) => {
	const { pagination, filters, sortField, sortOrder, ...restParams } = params;
	const result: Record<string, any> = {};

	// https://github.com/mockapi-io/docs/wiki/Code-examples#pagination
	result.limit = pagination?.pageSize;
	result.page = pagination?.current;

	// https://github.com/mockapi-io/docs/wiki/Code-examples#filtering
	if (filters) {
		for (const [key, value] of Object.entries(filters)) {
			if (value !== undefined && value !== null) {
				result[key] = value;
			}
		}
	}

	// https://github.com/mockapi-io/docs/wiki/Code-examples#sorting
	if (sortField) {
		result.orderby = sortField;
		result.order = sortOrder === "ascend" ? "asc" : "desc";
	}

	// 处理其他参数
	for (const [key, value] of Object.entries(restParams)) {
		if (value !== undefined && value !== null) {
			result[key] = value;
		}
	}

	return result;
};

const App: React.FC = () => {
	const [data, setData] = useState<PageList<UserInfo>>();
	const [loading, setLoading] = useState(false);
	const [tableParams, setTableParams] = useState<TableParams>({
		pagination: {
			current: 1,
			pageSize: 10,
		},
	});

	const params = toURLSearchParams(getRandomuserParams(tableParams));
	const getData = async () => {
		const response = await userService.searchPageList(params.toString());
		setData(response);
		console.log(response);

		setTableParams({
			pagination: {
				current: response.page,
				total: response.total,
				pageSize: response.page_size,
			},
		});
		setLoading(false);
	};
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		setLoading(true);
		getData();
		// setData(User);
	}, [
		tableParams.pagination?.current,
		tableParams.pagination?.pageSize,
		tableParams?.sortOrder,
		tableParams?.sortField,
		JSON.stringify(tableParams.filters),
	]);
	const handleTableChange: TableProps<UserInfo>["onChange"] = (pagination, filters, sorter) => {
		setTableParams({
			pagination,
			filters,
			sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
			sortField: Array.isArray(sorter) ? undefined : sorter.field,
		});

		// `dataSource` is useless since `pageSize` changed
		if (pagination.pageSize !== tableParams.pagination?.pageSize) {
			setData(undefined);
		}
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>User List</div>
					<Button onClick={() => {}}>New</Button>
				</div>
			</CardHeader>
			<CardContent>
				<Table<UserInfo>
					rowKey={(record) => record.id}
					size="small"
					scroll={{ x: "max-content" }}
					pagination={false}
					columns={columns}
					dataSource={data?.list}
					loading={loading}
					onChange={handleTableChange}
				/>
			</CardContent>
		</Card>
	);
};

export default App;
