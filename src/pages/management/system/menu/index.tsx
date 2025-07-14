import menuService from "@/api/services/menuService";
import { Icon } from "@/components/icon";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import type { TableProps } from "antd";
import { Popconfirm, Table } from "antd";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Menu } from "#/entity";
import MenuModal, { type MenuModalProps } from "./menu-modal";

type ColumnsType<T extends object = object> = TableProps<T>["columns"];

const defaultValue: Menu = {
  id: 0,
  menu_level: 0,
  parent_id: 0,
  name: "",
  path: "",
  hidden: 0,
  component: "",
  sort: 0,
  active_name: "",
  keep_alive: 0,
  default_menu: 0,
  title: "",
  icon: "",
  close_tab: 0,
  created_at: "",
  updated_at: "",
  level: [],
  children: [],
};

const App: React.FC = () => {
  const [data, setData] = useState<Menu[]>();
  const [loading, setLoading] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<number[]>([]);

  const [menuModalProps, setUserModalProps] = useState<MenuModalProps>({
    formValue: { ...defaultValue },
    title: "New",
    show: false,
    isCreateSub: false,
    onOk: async (values: Menu) => {
      if (values.id === 0) {
        await menuService.createMenu(values);
      } else {
        await menuService.updateMenu(values.id, values);
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
    const response = await menuService.getMenus();
    setData(response);
    setLoading(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    getData();
  }, [getData]);

  const onCreate = (formValue: Menu | undefined, isCreateSub = false) => {
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

  const onEdit = (formValue: Menu) => {
    setUserModalProps((prev) => ({
      ...prev,
      show: true,
      title: "Edit",
      isCreateSub: false,
      formValue,
    }));
  };

  const handleDelete = async (id: number) => {
    try {
      await menuService.deleteMenu(id);
      toast.success("删除成功");
      getData();
    } catch (error) {
      console.error(error);
      toast.error("删除失败");
    }
  };

  const handleExpand = (expanded: boolean, record: Menu) => {
    const keys = expanded
      ? [...expandedKeys, record.id]
      : expandedKeys.filter((key) => key !== record.id);
    setExpandedKeys(keys);
  };
  const columns: ColumnsType<Menu> = [
    {
      title: "菜单ID",
      dataIndex: "expand",
      render: (_, record) => {
        const level = record.level.length;
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
      title: "展示名称",
      dataIndex: "title",
    },
    {
      title: "图标",
      dataIndex: "icon",
    },
    {
      title: "路由Name",
      dataIndex: "name",
    },
    {
      title: "路由Path",
      dataIndex: "path",
    },
    {
      title: "是否显示隐藏",
      dataIndex: "hidden",
    },
    {
      title: "父节点",
      dataIndex: "parent_id",
    },
    {
      title: "排序",
      dataIndex: "sort",
    },
    {
      title: "文件路径",
      dataIndex: "component",
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
            onClick={() => onCreate(record, true)}
            style={{ minWidth: "80px" }}
            className="flex flex-row  items-center justify-center gap-1 px-2 py-1"
          >
            <Icon icon="solar:add-square-bold" size={18} />
            <span className="text-xs">新增子路由</span>
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
    <Card title="Menu List">
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
      <MenuModal {...menuModalProps} />
    </Card>
  );
};

export default App;
