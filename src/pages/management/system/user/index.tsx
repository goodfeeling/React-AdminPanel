import userService from "@/api/services/userService";
import { Icon } from "@/components/icon";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
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
import type { TableProps } from "antd";
import { Card, Input, Popconfirm, Table } from "antd";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ColumnsType, PageList, TableParams, UserInfo } from "#/entity";
import PermissionModal, { type UserModalProps } from "./user-modal";

const defaultUserValue: UserInfo = {
  id: 0,
  email: "",
  user_name: "",
  nick_name: "",
  header_img: "",
  phone: "",
  status: false,
  created_at: "",
  updated_at: "",
};

type SearchFormFieldType = {
  user_name: string;
  status: string;
};

const App: React.FC = () => {
  const searchForm = useForm<SearchFormFieldType>({
    defaultValues: { user_name: "", status: "" },
  });
  const [data, setData] = useState<PageList<UserInfo>>();
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
  });
  const [userModalProps, setUserModalProps] = useState<UserModalProps>({
    formValue: { ...defaultUserValue },
    title: "New",
    show: false,
    onOk: async (values: UserInfo) => {
      if (values.id === 0) {
        await userService.createUser(values);
      } else {
        const {
          user_name = "",
          email = "",
          phone = "",
          header_img,
          nick_name = "",
          status = false,
        } = values;
        await userService.updateUser(values.id, {
          user_name,
          email,
          phone,
          header_img,
          nick_name,
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
    const params = toURLSearchParams(
      getRandomUserParams(tableParams, (result, searchParams) => {
        if (searchParams) {
          if (searchParams.user_name) {
            result.userName_like = searchParams.user_name;
          }
          if (searchParams.status) {
            result.status_match = searchParams.status;
          }
        }
      })
    );

    const response = await userService.searchPageList(params.toString());
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
    tableParams?.searchParams?.user_name,
    tableParams?.searchParams?.status,
    JSON.stringify(tableParams.filters),
  ]);

  const handleTableChange: TableProps<UserInfo>["onChange"] = (
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
      await userService.deleteUser(id);
      toast.success("删除成功");
      getData();
    } catch (error) {
      console.error(error);
      toast.error("删除失败");
    }
  };

  const columns: ColumnsType<UserInfo> = [
    {
      title: "ID",
      dataIndex: "id",
      sorter: true,
      width: "5%",
    },
    {
      title: "用户",
      dataIndex: "user_name",
      width: 300,
      render: (_, record) => {
        return (
          <div className="flex">
            <img
              alt=""
              src={record.header_img}
              className="h-10 w-10 rounded-full"
            />
            <div className="ml-2 flex flex-col">
              <span className="text-sm">{record.user_name}</span>
              <span className="text-xs text-text-secondary">
                {record.email}
              </span>
            </div>
          </div>
        );
      },
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(record)}
            style={{ minWidth: "90px" }}
            className="flex flex-row  items-center justify-center gap-1 px-2 py-1"
          >
            <Icon icon="solar:pen-bold-duotone" size={18} />
            <span className="text-xs">重置密码</span>
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
      searchParams: {
        user_name: "",
        status: "3",
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
        user_name: values.user_name || "",
        status: values.status,
      },
      pagination: {
        ...prev.pagination,
        current: 1,
      },
    }));
  };

  const onCreate = () => {
    setUserModalProps((prev) => ({
      ...prev,
      show: true,
      ...defaultUserValue,
      title: "New",
      formValue: { ...defaultUserValue },
    }));
  };

  const onEdit = (formValue: UserInfo) => {
    setUserModalProps((prev) => ({
      ...prev,
      show: true,
      title: "Edit",
      formValue,
    }));
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent>
          <Form {...searchForm}>
            <div className="flex items-center gap-4">
              <FormField
                control={searchForm.control}
                name="user_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UserName</FormLabel>
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
                        <SelectItem value="1">
                          <Badge variant="success">Enable</Badge>
                        </SelectItem>
                        <SelectItem value="0">
                          <Badge variant="error">Disable</Badge>
                        </SelectItem>
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
      <Card title="User List">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button onClick={() => onCreate()}>
              <Icon icon="solar:add-circle-outline" size={18} />
              New
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Table<UserInfo>
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
    </div>
  );
};

export default App;
