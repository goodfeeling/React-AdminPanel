import { Icon } from "@/components/icon";
import { useUserPermission } from "@/store/userStore";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Popconfirm } from "antd";
import Table, { type ColumnsType } from "antd/es/table";
import { List } from "antd/lib";
import { isNil } from "ramda";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Permission } from "#/entity";
import { BasicStatus, PermissionType } from "#/enum";
import PermissionModal, { type PermissionModalProps } from "./dict-modal";

const defaultPermissionValue: Permission = {
  id: "",
  parentId: "",
  name: "",
  label: "",
  route: "",
  component: "",
  icon: "",
  hide: false,
  status: BasicStatus.ENABLE,
  type: PermissionType.CATALOGUE,
};
export default function PermissionPage() {
  const permissions = useUserPermission();
  const { t } = useTranslation();

  const [permissionModalProps, setPermissionModalProps] =
    useState<PermissionModalProps>({
      formValue: { ...defaultPermissionValue },
      title: "New",
      show: false,
      onOk: () => {
        setPermissionModalProps((prev) => ({ ...prev, show: false }));
      },
      onCancel: () => {
        setPermissionModalProps((prev) => ({ ...prev, show: false }));
      },
    });

  const columns: ColumnsType<Permission> = [
    {
      title: "Name",
      dataIndex: "name",
      width: 300,
      render: (_, record) => <div>{t(record.label)}</div>,
    },
    {
      title: "Type",
      dataIndex: "type",
      width: 60,
      render: (_, record) => (
        <Badge variant="info">{PermissionType[record.type]}</Badge>
      ),
    },
    {
      title: "Icon",
      dataIndex: "icon",
      width: 60,
      render: (icon: string) => {
        if (isNil(icon)) return "";
        if (icon.startsWith("ic")) {
          return (
            <Icon
              icon={`local:${icon}`}
              size={18}
              className="ant-menu-item-icon"
            />
          );
        }
        return <Icon icon={icon} size={18} className="ant-menu-item-icon" />;
      },
    },
    {
      title: "Component",
      dataIndex: "component",
    },
    {
      title: "Status",
      dataIndex: "status",
      align: "center",
      width: 120,
      render: (status) => (
        <Badge variant={status === BasicStatus.DISABLE ? "error" : "success"}>
          {status === BasicStatus.DISABLE ? "Disable" : "Enable"}
        </Badge>
      ),
    },
    { title: "Order", dataIndex: "order", width: 60 },
    {
      title: "Action",
      key: "operation",
      align: "center",
      width: 100,
      render: (_, record) => (
        <div className="flex w-full justify-end text-gray">
          {record?.type === PermissionType.CATALOGUE && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onCreate(record.id)}
            >
              <Icon icon="gridicons:add-outline" size={18} />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => onEdit(record)}>
            <Icon icon="solar:pen-bold-duotone" size={18} />
          </Button>
          <Button variant="ghost" size="icon">
            <Icon
              icon="mingcute:delete-2-fill"
              size={18}
              className="text-error!"
            />
          </Button>
        </div>
      ),
    },
  ];

  const onCreate = (parentId?: string) => {
    setPermissionModalProps((prev) => ({
      ...prev,
      show: true,
      ...defaultPermissionValue,
      title: "New",
      formValue: { ...defaultPermissionValue, parentId: parentId ?? "" },
    }));
  };

  const onEdit = (formValue: Permission) => {
    setPermissionModalProps((prev) => ({
      ...prev,
      show: true,
      title: "Edit",
      formValue,
    }));
  };

  const data = [
    {
      title: "标题1",
      content: "内容1",
    },
    {
      title: "标题2",
      content: "内容2",
    },
    {
      title: "标题3",
      content: "内容3",
    },
  ];
  const handleDelete = (id: string) => {
    // 实现删除逻辑，例如调用 API 或更新本地状态
    console.log("Deleting item:", id);
  };
  const onDictionaryEdit = (obj: object) => {};
  return (
    <Card>
      <div className="flex">
        <CardContent className="w-1/4">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>Dictionary List</div>
              <Button onClick={() => onCreate()}>New</Button>
            </div>
          </CardHeader>
          <List
            dataSource={data}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    key="edit"
                    variant="default"
                    size="icon"
                    onClick={() =>
                      onDictionaryEdit({ id: item.title, label: item.title })
                    }
                  >
                    <Icon icon="solar:pen-bold-duotone" size={18} />
                  </Button>,
                  <Popconfirm
                    key="delete"
                    title="Delete the item"
                    description="Are you sure to delete this item?"
                    onConfirm={() => handleDelete(item.title)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button variant="ghost" size="icon" className="text-error">
                      <Icon icon="mingcute:delete-2-fill" size={18} />
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  title={<span className="text-foreground">{item.title}</span>}
                />
              </List.Item>
            )}
          />
        </CardContent>
        <CardContent className="w-3/4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>Dictionary Detail List</div>
              <Button onClick={() => onCreate()}>New</Button>
            </div>
          </CardHeader>
          <Table
            rowKey="id"
            size="small"
            scroll={{ x: "max-content" }}
            pagination={false}
            columns={columns}
            dataSource={permissions}
          />
        </CardContent>
      </div>
      <PermissionModal {...permissionModalProps} />
    </Card>
  );
}
