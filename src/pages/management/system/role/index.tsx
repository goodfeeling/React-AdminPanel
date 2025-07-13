import roleService from "@/api/services/roleService";
import { Icon } from "@/components/icon";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import type { TableProps } from "antd";
import { Popconfirm, Table } from "antd";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Role } from "#/entity";
import RoleModal, { type RoleModalProps } from "./role-modal";
import SettingModal, { type SettingModalProps } from "./setting-modal";

type ColumnsType<T extends object = object> = TableProps<T>["columns"];

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
  children: [],
  path: [],
};

const App: React.FC = () => {
  const [data, setData] = useState<Role[]>();
  const [loading, setLoading] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<number[]>([]);

  const [settingModalPros, setSettingModalProps] = useState<SettingModalProps>({
    id: 0,
    title: "New",
    show: false,
    onCancel: () => {
      setSettingModalProps((prev) => ({ ...prev, show: false }));
    },
  });

  const [roleModalProps, setUserModalProps] = useState<RoleModalProps>({
    formValue: { ...defaultValue },
    title: "New",
    show: false,
    isCreateSub: false,
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

  const getData = useCallback(async () => {
    const response = await roleService.getRoles();
    setData(response);
    setLoading(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    getData();
  }, [getData]);

  const onCreate = (formValue: Role | undefined, isCreateSub = false) => {
    const setValue = defaultValue;
    if (formValue !== undefined) {
      setValue.parent_id = formValue.id;
    }
    setUserModalProps((prev) => ({
      ...prev,
      show: true,
      isCreateSub,
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
      isCreateSub: false,
      formValue,
    }));
  };

  const onSetting = (value: Role) => {
    setSettingModalProps((prev) => ({
      ...prev,
      show: true,
      title: "角色设置",
      id: value.id,
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

  const handleExpand = (expanded: boolean, record: Role) => {
    const keys = expanded
      ? [...expandedKeys, record.id]
      : expandedKeys.filter((key) => key !== record.id);
    setExpandedKeys(keys);
  };
  const columns: ColumnsType<Role> = [
    {
      title: "角色ID",
      dataIndex: "expand",
      render: (_, record) => {
        const level = record.path.length;
        return record.children?.length ? (
          <Button
            onClick={(e) =>
              handleExpand(!expandedKeys.includes(record.id), record)
            }
            variant="ghost"
            size="icon"
            style={{
              marginLeft: record.parent_id !== 0 ? `${level * 20}px` : "",
            }}
          >
            {expandedKeys.includes(record.id) ? "▼" : "▶"}
            <span>{record.id}</span>
          </Button>
        ) : (
          <span style={{ marginLeft: `${level * 20}px` }}>{record.id}</span>
        );
      },

      width: 90,
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
      fixed: "right",
      render: (_, record) => (
        <div className="flex w-full justify-center text-gray-500">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSetting(record)}
            style={{ minWidth: "110px" }}
            className="flex flex-row  items-center justify-center gap-1 px-2 py-1"
          >
            <Icon icon="solar:settings-bold" size={18} />
            <span className="text-xs">设置权限</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCreate(record, true)}
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
          <Button onClick={() => onCreate(undefined, true)}>
            <Icon icon="solar:add-circle-outline" size={18} />
            New
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Table
          rowKey={(record) => record.id}
          scroll={{ x: "max-content" }}
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={false}
          expandable={{
            showExpandColumn: false,
            expandedRowKeys: expandedKeys,
            onExpand: (expanded, record) => handleExpand(expanded, record),
          }}
        />
      </CardContent>
      <RoleModal {...roleModalProps} />
      <SettingModal {...settingModalPros} />
    </Card>
  );
};

export default App;
