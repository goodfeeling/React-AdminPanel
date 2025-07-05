import roleService from "@/api/services/roleService";
import { Button } from "@/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/ui/form";
import { Input } from "@/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/ui/toggle-group";
import TreeSelectInput from "@/ui/tree-select-input";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { Role, RoleTree } from "#/entity";
import { BasicStatus } from "#/enum";
export type RoleModalProps = {
  formValue: Role;
  title: string;
  show: boolean;
  isCreateSub: boolean;
  onOk: (values: Role) => void;
  onCancel: VoidFunction;
};
export default function UserModal({
  title,
  show,
  isCreateSub,
  formValue,
  onOk,
  onCancel,
}: RoleModalProps) {
  const [treeData, setTreeData] = useState<RoleTree[]>([]);
  const [selectedKey, setSelectedKey] = useState<number>(0);
  const form = useForm<Role>({
    defaultValues: formValue,
  });
  const onSubmit = () => {
    const values = form.getValues();
    values.order = Number(values.order);
    onOk(values);
  };

  const onLoadRoleTree = useCallback(async () => {
    const response = await roleService.getRoleTree();
    setTreeData([response]);
  }, []);

  useEffect(() => {
    form.reset(formValue);
    onLoadRoleTree();
    if (formValue.parent_id) {
      setSelectedKey(formValue.parent_id);
    }
  }, [formValue, form, onLoadRoleTree]);

  const handleClose = () => {
    setSelectedKey(0); // 清除选中状态
    // setDisabledStatus(false);
    onCancel(); // 关闭弹框
  };

  return (
    <Dialog open={show} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="parent_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent</FormLabel>
                <FormControl>
                  <TreeSelectInput
                    treeData={treeData}
                    disabled={isCreateSub}
                    value={String(selectedKey)}
                    onChange={(value: string) => {
                      field.onChange(value);
                    }}
                    placeholder="请选择父级角色"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem>
                <FormLabel>label</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>description</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>order</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    value={field.value ? "1" : "0"}
                    onValueChange={(value) => {
                      field.onChange(value === "1");
                    }}
                  >
                    <ToggleGroupItem value={String(BasicStatus.ENABLE)}>
                      Enable
                    </ToggleGroupItem>
                    <ToggleGroupItem value={String(BasicStatus.DISABLE)}>
                      Disable
                    </ToggleGroupItem>
                  </ToggleGroup>
                </FormControl>
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button variant="outline" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="default" onClick={onSubmit}>
              Confirm
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
