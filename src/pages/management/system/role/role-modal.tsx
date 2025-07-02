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
import { TreeSelect, TreeSelectProps } from "antd";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { Role, RoleTree } from "#/entity";
import { BasicStatus } from "#/enum";
export type RoleModalProps = {
  formValue: Role;
  title: string;
  show: boolean;
  onOk: (values: Role) => void;
  onCancel: VoidFunction;
};
export default function UserModal({
  title,
  show,
  formValue,
  onOk,
  onCancel,
}: RoleModalProps) {
  const form = useForm<Role>({
    defaultValues: formValue,
  });
  const [treeData, setTreeData] = useState<RoleTree[]>([]);

  const onSubmit = (values: Role) => {
    onOk(values);
  };

  const onLoadRoleTree = useCallback(async () => {
    const response = await roleService.getRoleTree();
    setTreeData(response);
  }, []);

  useEffect(() => {
    form.reset(formValue);
    onLoadRoleTree();
  }, [formValue, form, onLoadRoleTree]);

  return (
    <Dialog open={show} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                <FormItem style={{ zIndex: 999 }}>
                  <FormLabel>Parent</FormLabel>
                  <TreeSelect
                    treeDefaultExpandAll={true}
                    variant="filled"
                    allowClear
                    treeData={treeData}
                    value={field.value}
                    onSelect={(value, node) => {
                      console.log("onSelect");

                      field.onChange(value);
                    }}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    onOpenChange={(v) => {
                      console.log(v);
                    }}
                  />
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
              <Button variant="outline" type="button" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" variant="default">
                Confirm
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
