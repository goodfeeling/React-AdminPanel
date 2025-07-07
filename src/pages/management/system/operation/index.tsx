import operationService from "@/api/services/operationService";
import { Icon } from "@/components/icon";
import { Button } from "@/ui/button";
import { CardContent, CardHeader } from "@/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/ui/form";
import { getRandomUserParams, toURLSearchParams } from "@/utils";
import type { TableProps } from "antd";
import { Card, Input, Popconfirm, Table } from "antd";
import type { TableRowSelection } from "antd/es/table/interface";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ColumnsType, Operation, PageList, TableParams } from "#/entity";

type SearchFormFieldType = {
  method: string;
  path: string;
  status: number;
};

const App: React.FC = () => {
  const searchForm = useForm<SearchFormFieldType>({
    defaultValues: { path: "", method: "", status: 0 },
  });
  const [data, setData] = useState<PageList<Operation>>();
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    sortField: "id",
    sortOrder: "descend",
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const getData = async () => {
    const params = toURLSearchParams(
      getRandomUserParams(tableParams, (result, searchParams) => {
        if (searchParams) {
          if (searchParams.method) {
            result.method_like = searchParams.method;
          }
          if (searchParams.status) {
            result.status_match = searchParams.status;
          }
          if (searchParams.path) {
            result.path_like = searchParams.path;
          }
        }
      })
    );
    const response = await operationService.searchPageList(params.toString());
    setData(response);
    setTableParams((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        current: response.page,
        total: response.total,
        pageSize: response.page_size,
      },
    }));
    setLoading(false);
  };
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    setLoading(true);
    getData();
  }, [
    tableParams.pagination?.current,
    tableParams.pagination?.pageSize,
    tableParams?.sortOrder,
    tableParams?.sortField,
    tableParams?.searchParams?.method,
    tableParams?.searchParams?.status,
    tableParams?.searchParams?.path,
    JSON.stringify(tableParams.filters),
  ]);

  const handleTableChange: TableProps<Operation>["onChange"] = (
    pagination,
    filters,
    sorter
  ) => {
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

  const handleDelete = async (id: number) => {
    try {
      await operationService.deleteBatch([id]);
      toast.success("删除成功");
      getData();
    } catch (error) {
      console.error(error);
      toast.error("删除失败");
    }
  };

  const handleDeleteSelection = async () => {
    try {
      await operationService.deleteBatch(selectedRowKeys as number[]);
      toast.success("删除成功");
      getData();
    } catch (error) {
      console.error(error);
      toast.error("删除失败");
    }
  };

  const columns: ColumnsType<Operation> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "IP 地址",
      dataIndex: "ip",
      key: "ip",
    },
    {
      title: "请求路径",
      dataIndex: "path",
      key: "path",
    },
    {
      title: "请求方法",
      dataIndex: "method",
      key: "method",
    },
    {
      title: "状态码",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "延迟 (ms)",
      dataIndex: "latency",
      key: "latency",
    },
    {
      title: "用户代理",
      dataIndex: "agent",
      key: "agent",
    },
    {
      title: "错误信息",
      dataIndex: "error_message",
      key: "error_message",
    },
    {
      title: "请求体",
      dataIndex: "body",
      key: "body",
      ellipsis: true,
    },
    {
      title: "响应内容",
      dataIndex: "resp",
      key: "resp",
      ellipsis: true,
    },
    {
      title: "创建时间",
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: "更新时间",
      dataIndex: "updated_at",
      key: "updated_at",
    },
    {
      title: "操作",
      key: "operation",
      align: "center",
      width: 100,
      render: (_, record) => (
        <div className="flex w-full justify-center text-gray-500">
          <Popconfirm
            title="Delete the task"
            description="Are you sure to delete this task?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              variant="ghost"
              size="icon"
              className="flex flex-row  items-center justify-center gap-1 px-2 py-1 text-error"
            >
              <Icon
                icon="mingcute:delete-2-fill"
                size={18}
                className="text-error!"
              />
              <span className="text-xs">删除</span>
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const onReset = () => {
    setTableParams((prev) => ({
      ...prev,
      searchParams: {
        method: "",
        path: "",
        status: 0,
      },
      pagination: {
        ...prev.pagination,
        current: 1,
      },
    }));
    searchForm.reset();
  };

  const onSearch = () => {
    const values = searchForm.getValues();
    setTableParams((prev) => ({
      ...prev,
      searchParams: {
        method: values.method || "",
        path: values.path || "",
        status: values.status,
      },
      pagination: {
        ...prev.pagination,
        current: 1,
      },
    }));
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection: TableRowSelection<Operation> = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
      {
        key: "odd",
        text: "Select Odd Row",
        onSelect: (changeableRowKeys) => {
          let newSelectedRowKeys = [];
          newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
            if (index % 2 !== 0) {
              return false;
            }
            return true;
          });
          setSelectedRowKeys(newSelectedRowKeys);
        },
      },
      {
        key: "even",
        text: "Select Even Row",
        onSelect: (changeableRowKeys) => {
          let newSelectedRowKeys = [];
          newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
            if (index % 2 !== 0) {
              return true;
            }
            return false;
          });
          setSelectedRowKeys(newSelectedRowKeys);
        },
      },
    ],
  };

  const hasSelected = selectedRowKeys.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <Card title="Log List">
        <CardContent>
          <Form {...searchForm}>
            <div className="flex items-center gap-4">
              <FormField
                control={searchForm.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Method</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={searchForm.control}
                name="path"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Path</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={searchForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex ml-auto">
                <Button variant="outline" onClick={() => onReset()}>
                  Reset
                </Button>
                <Button className="ml-4" onClick={() => onSearch()}>
                  Search
                </Button>
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="destructive"
              onClick={() => handleDeleteSelection()}
              disabled={!hasSelected}
            >
              Delete
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table<Operation>
            rowKey={(record) => record.id}
            rowSelection={rowSelection}
            scroll={{ x: "max-content" }}
            columns={columns}
            pagination={{
              current: tableParams.pagination?.current || 1,
              pageSize: tableParams.pagination?.pageSize || 10,
              total: tableParams?.pagination?.total || 0,
              showTotal: (total) => `共 ${total} 条`,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
            }}
            dataSource={data?.list}
            loading={loading}
            onChange={handleTableChange}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default App;
