import { Icon } from "@/components/icon";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import type { GetProp, TableProps } from "antd";
import { Card, Popconfirm, Table } from "antd";
import type { AnyObject } from "antd/es/_util/type";
import type { SorterResult } from "antd/es/table/interface";
import { useEffect, useState } from "react";
import type { PageList, Role } from "#/entity";
type ColumnsType<T extends object = object> = TableProps<T>["columns"];
type TablePaginationConfig = Exclude<
  GetProp<TableProps, "pagination">,
  boolean
>;
import roleService from "@/api/services/roleService";
import { CardContent, CardHeader } from "@/ui/card";
import { toast } from "sonner";
import PermissionModal, { type RoleModalProps } from "./role-modal";

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: SorterResult<any>["field"];
  sortOrder?: SorterResult<any>["order"];
  filters?: Parameters<GetProp<TableProps, "onChange">>[1];
  parentId?: number;
}

const toURLSearchParams = <T extends AnyObject>(record: T) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(record)) {
    params.append(key, value);
  }
  return params;
};

const getRandomUserParams = (params: TableParams) => {
  const { pagination, filters, sortField, sortOrder, ...restParams } = params;
  const result: Record<string, any> = {};

  // https://github.com/mockapi-io/docs/wiki/Code-examples#pagination
  result.pageSize = pagination?.pageSize;
  result.page = pagination?.current;

  // https://github.com/mockapi-io/docs/wiki/Code-examples#filtering
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        result[`${key}_match`] = value;
      }
    }
  }

  // https://github.com/mockapi-io/docs/wiki/Code-examples#sorting
  if (sortField) {
    result.sortby = sortField;
    result.sortDirection = sortOrder === "ascend" ? "asc" : "desc";
  }

  // 处理其他参数
  for (const [key, value] of Object.entries(restParams)) {
    if (value !== undefined && value !== null) {
      result[`${key}_match`] = value;
    }
  }

  return result;
};

const defaultValue: Role = {
  id: 0,
  parent_id: 0,
  name: "",
  label: "",
  order: 0,
  description: "",
  status: false,
  created_at: "",
  updated_at: "",
  default_router: "",
};

const App: React.FC = () => {
  const [data, setData] = useState<PageList<Role>>();
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    parentId: 0,
  });

  const [userModalProps, setUserModalProps] = useState<RoleModalProps>({
    formValue: { ...defaultValue },
    title: "New",
    show: false,
    onOk: async (values: Role) => {
      if (values.id === 0) {
        await roleService.createUser(values);
      } else {
        const {
          parent_id = 0,
          name = "",
          label = "",
          order = 0,
          description = "",
          status = false,
        } = values;
        await roleService.updateUser(values.id, {
          parent_id,
          name,
          label,
          order,
          description,
          status,
        });
      }
      toast.success("success!");
      setUserModalProps((prev) => ({ ...prev, show: false }));
      getData();
    },
    onCancel: () => {
      setUserModalProps((prev) => ({ ...prev, show: false }));
    },
  });

  const getData = async () => {
    const params = toURLSearchParams(getRandomUserParams(tableParams));
    const response = await roleService.searchPageList(params.toString());
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
    JSON.stringify(tableParams.filters),
  ]);

  const handleTableChange: TableProps<Role>["onChange"] = (
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

  const onCreate = (formValue: Role | undefined) => {
    const setValue = defaultValue;
    if (formValue !== undefined) {
      setValue.parent_id = formValue.parent_id;
    }
    setUserModalProps((prev) => ({
      ...prev,
      show: true,
      ...setValue,
      title: "New",
      formValue: { ...setValue },
    }));
  };

  const onEdit = (formValue: Role) => {
    setUserModalProps((prev) => ({
      ...prev,
      show: true,
      title: "Edit",
      formValue,
    }));
  };

  const handleDelete = async (id: number) => {
    try {
      await roleService.deleteUser(id);
      toast.success("删除成功");
      getData();
    } catch (error) {
      console.error(error);
      toast.error("删除失败");
    }
  };

  const columns: ColumnsType<Role> = [
    {
      title: "ID",
      dataIndex: "id",
      width: "5%",
    },
    {
      title: "名称",
      dataIndex: "name",
    },
    {
      title: "标签",
      dataIndex: "label",
    },
    {
      title: "排序",
      dataIndex: "order",
    },
    {
      title: "描述",
      dataIndex: "description",
    },
    {
      title: "状态",
      dataIndex: "status",
      align: "center",
      width: 120,
      render: (status) => {
        return (
          <Badge variant={status ? "success" : "error"}>
            {status ? "Enable" : "Disabled"}
          </Badge>
        );
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
    {
      title: "操作",
      key: "operation",
      align: "center",
      width: 300,
      render: (_, record) => (
        <div className="flex w-full justify-center text-gray-500">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(record)}
            style={{ minWidth: "110px" }}
            className="flex flex-row  items-center justify-center gap-1 px-2 py-1"
          >
            <Icon icon="solar:settings-bold" size={18} />
            <span className="text-xs">设置权限</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCreate(record)}
            style={{ minWidth: "80px" }}
            className="flex flex-row  items-center justify-center gap-1 px-2 py-1"
          >
            <Icon icon="solar:add-square-bold" size={18} />
            <span className="text-xs">新增子角色</span>
          </Button>
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

  return (
    <Card title="Role List">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Button onClick={() => onCreate(undefined)}>New</Button>
        </div>
      </CardHeader>

      <CardContent>
        <Table<Role>
          rowKey={(record) => record.id}
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
      <PermissionModal {...userModalProps} />
    </Card>
  );
};

export default App;
