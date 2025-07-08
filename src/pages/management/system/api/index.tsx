import { Icon } from "@/components/icon";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import type { TableProps } from "antd";
import { Card, Input, Popconfirm, Table } from "antd";
import type { TableRowSelection } from "antd/es/table/interface";
import { useCallback, useEffect, useState } from "react";
import type {
  Api,
  ApiGroup,
  ColumnsType,
  PageList,
  TableParams,
} from "#/entity";

import apiService from "@/api/services/apisService";
import { Methods } from "@/types/enum";
import { CardContent, CardHeader } from "@/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { getRandomUserParams, toURLSearchParams } from "@/utils";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import ApiModal, { type ApiModalProps } from "./api-modal";

const defaultApiValue: Api = {
  id: 0,
  path: "",
  api_group: "",
  method: "",
  description: "",
  created_at: "",
  updated_at: "",
};

type SearchFormFieldType = {
  path?: string;
  description?: string;
  api_group?: string;
  method?: string;
};

const App: React.FC = () => {
  const searchForm = useForm<SearchFormFieldType>({
    defaultValues: {
      path: "",
      description: "",
      api_group: "",
      method: "",
    },
  });
  const [data, setData] = useState<PageList<Api>>();
  const [loading, setLoading] = useState(false);
  const [apiGroup, setApiGroup] = useState<ApiGroup>();
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
  const [apiModalProps, setApiModalProps] = useState<ApiModalProps>({
    formValue: { ...defaultApiValue },
    apiGroup: undefined,
    title: "New",
    show: false,
    onOk: async (values: Api) => {
      if (values.id === 0) {
        await apiService.createApi(values);
      } else {
        await apiService.updateApi(values.id, values);
      }
      toast.success("success!");
      setApiModalProps((prev) => ({ ...prev, show: false }));
      getData();
    },
    onCancel: () => {
      setApiModalProps((prev) => ({ ...prev, show: false }));
    },
  });

  const getData = useCallback(async () => {
    const params = toURLSearchParams(
      getRandomUserParams(tableParams, (result, searchParams) => {
        if (searchParams) {
          if (searchParams.path) {
            result.path_like = searchParams.path;
          }
          if (searchParams.description) {
            result.description_like = searchParams.description;
          }

          if (searchParams.method) {
            result.method_match = searchParams.method;
          }
          if (searchParams.api_group) {
            result.apiGroup_match = searchParams.api_group;
          }
        }
      })
    );

    const response = await apiService.searchPageList(params.toString());
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
  }, [tableParams]);

  const getGroups = useCallback(async () => {
    const response = await apiService.getApiGroups();
    setApiGroup(response);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    setLoading(true);
    getData();
    getGroups();
  }, [
    tableParams.pagination?.current,
    tableParams.pagination?.pageSize,
    tableParams?.sortOrder,
    tableParams?.sortField,
    tableParams?.searchParams?.description,
    tableParams?.searchParams?.path,
    tableParams?.searchParams?.api_group,
    tableParams?.searchParams?.method,
    JSON.stringify(tableParams.filters),
  ]);

  const handleTableChange: TableProps<Api>["onChange"] = (
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

  const onCreate = () => {
    setApiModalProps((prev) => ({
      ...prev,
      apiGroup,
      show: true,
      ...defaultApiValue,
      title: "New",
      formValue: { ...defaultApiValue },
    }));
  };

  const onEdit = (formValue: Api) => {
    setApiModalProps((prev) => ({
      ...prev,
      apiGroup,
      show: true,
      title: "Edit",
      formValue,
    }));
  };

  const handleDelete = async (id: number) => {
    try {
      await apiService.deleteApi(id);
      toast.success("删除成功");
      getData();
    } catch (error) {
      console.error(error);
      toast.error("删除失败");
    }
  };

  const handleDeleteSelection = async () => {
    try {
      await apiService.deleteBatch(selectedRowKeys as number[]);
      toast.success("删除成功");
      getData();
    } catch (error) {
      console.error(error);
      toast.error("删除失败");
    }
  };

  const columns: ColumnsType<Api> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "路径",
      dataIndex: "path",
      key: "path",
      ellipsis: true,
    },
    {
      title: "所属组",
      dataIndex: "api_group",
      key: "api_group",
    },
    {
      title: "请求方法",
      dataIndex: "method",
      key: "method",
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(record)}
            style={{ minWidth: "70px" }}
            className="flex flex-row  items-center justify-center gap-1 px-2 py-1"
          >
            <Icon icon="solar:pen-bold-duotone" size={18} />
            <span className="text-xs">修改</span>
          </Button>
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
        ...values,
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

  const rowSelection: TableRowSelection<Api> = {
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
      <Card>
        <CardContent>
          <Form {...searchForm}>
            <div className="flex items-center gap-4">
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={searchForm.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(Methods).map(([key, value]) => {
                          if (Number.isNaN(Number(key))) {
                            return (
                              <SelectItem value={key} key={key}>
                                <Badge variant="default">{value}</Badge>
                              </SelectItem>
                            );
                          }
                          return null;
                        })}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={searchForm.control}
                name="api_group"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ApiGroup</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {apiGroup?.groups.map((item) => {
                          return (
                            <SelectItem value={item} key={item}>
                              <Badge variant="success">{item}</Badge>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <div className="flex ml-auto">
                <Button variant="outline" onClick={() => onReset()}>
                  <Icon icon="solar:restart-line-duotone" size={18} />
                  Reset
                </Button>
                <Button
                  variant="default"
                  className="ml-4"
                  onClick={() => onSearch()}
                >
                  <Icon icon="solar:rounded-magnifer-linear" size={18} />
                  Search
                </Button>
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
      <Card title="Api List">
        <CardHeader>
          <div className="flex items-start justify-start">
            <Button onClick={() => onCreate()} variant="default">
              <Icon icon="solar:add-circle-outline" size={18} />
              New
            </Button>
            <Button
              onClick={() => handleDeleteSelection()}
              variant="ghost"
              className="ml-2"
              disabled={!hasSelected}
            >
              <Icon icon="solar:trash-bin-minimalistic-outline" size={18} />
              Delete
            </Button>
            <Button
              onClick={() => onCreate()}
              variant="outline"
              className="ml-2"
            >
              <Icon icon="solar:refresh-outline" size={18} />
              Synchronize
            </Button>
            <Button
              onClick={() => onCreate()}
              className="ml-2"
              variant="default"
            >
              <Icon icon="solar:cloud-download-outline" size={18} />
              Download Template
            </Button>
            <Button
              onClick={() => onCreate()}
              className="ml-2"
              variant="default"
            >
              <Icon icon="solar:import-outline" size={18} />
              import
            </Button>
            <Button
              onClick={() => onCreate()}
              className="ml-2"
              variant="default"
            >
              <Icon icon="solar:export-outline" size={18} />
              export
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Table<Api>
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
        <ApiModal {...apiModalProps} />
      </Card>
    </div>
  );
};

export default App;
