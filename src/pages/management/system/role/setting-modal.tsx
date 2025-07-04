import { Icon } from "@/components/icon";
import { Dialog, DialogContent, DialogHeader } from "@/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Tree } from "antd";
import type { TreeDataNode, TreeProps } from "antd";
import { useState } from "react";

const treeData: TreeDataNode[] = [
  {
    title: "0-0",
    key: "0-0",
    children: [
      {
        title: "0-0-0",
        key: "0-0-0",
        children: [
          { title: "0-0-0-0", key: "0-0-0-0" },
          { title: "0-0-0-1", key: "0-0-0-1" },
          { title: "0-0-0-2", key: "0-0-0-2" },
        ],
      },
      {
        title: "0-0-1",
        key: "0-0-1",
        children: [
          { title: "0-0-1-0", key: "0-0-1-0" },
          { title: "0-0-1-1", key: "0-0-1-1" },
          { title: "0-0-1-2", key: "0-0-1-2" },
        ],
      },
      {
        title: "0-0-2",
        key: "0-0-2",
      },
    ],
  },
  {
    title: "0-1",
    key: "0-1",
    children: [
      { title: "0-1-0-0", key: "0-1-0-0" },
      { title: "0-1-0-1", key: "0-1-0-1" },
      { title: "0-1-0-2", key: "0-1-0-2" },
    ],
  },
  {
    title: "0-2",
    key: "0-2",
  },
];

export type SettingValue = {
  id: string;
};

export type SettingModalProps = {
  id: number;
  title: string;
  show: boolean;
  onCancel: VoidFunction;
};
export default function SettingModal({
  id,
  title,
  show,
  onCancel,
}: SettingModalProps) {
  console.log(title, show);

  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([
    "0-0-0",
    "0-0-1",
  ]);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>(["0-0-0"]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);

  const onExpand: TreeProps["onExpand"] = (expandedKeysValue) => {
    console.log("onExpand", expandedKeysValue);
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };

  const onCheck: TreeProps["onCheck"] = (checkedKeysValue) => {
    console.log("onCheck", checkedKeysValue);
    setCheckedKeys(checkedKeysValue as React.Key[]);
  };

  const onSelect: TreeProps["onSelect"] = (selectedKeysValue, info) => {
    console.log("onSelect", info);
    setSelectedKeys(selectedKeysValue);
  };

  return (
    <Dialog open={show} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>{title}</DialogHeader>
        <Tabs defaultValue="1" className="w-full">
          <TabsList>
            <TabsTrigger value="1">
              <div className="flex items-center">
                <Icon icon="solar:user-id-bold" size={24} className="mr-2" />
                <span>角色菜单</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="2">
              <div className="flex items-center">
                <Icon
                  icon="solar:bell-bing-bold-duotone"
                  size={24}
                  className="mr-2"
                />
                <span>角色api</span>
              </div>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="1">
            {" "}
            <Tree
              checkable
              onExpand={onExpand}
              expandedKeys={expandedKeys}
              autoExpandParent={autoExpandParent}
              onCheck={onCheck}
              checkedKeys={checkedKeys}
              onSelect={onSelect}
              selectedKeys={selectedKeys}
              treeData={treeData}
            />
          </TabsContent>
          <TabsContent value="2">2</TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
