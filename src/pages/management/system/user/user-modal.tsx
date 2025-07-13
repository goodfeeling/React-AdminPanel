import { UploadApi } from "@/api/services/uploadService";
import { UploadAvatar } from "@/components/upload";
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
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { UserInfo } from "#/entity";
import { BasicStatus } from "#/enum";

export type UserModalProps = {
  formValue: UserInfo;
  title: string;
  show: boolean;
  onOk: (values: UserInfo) => void;
  onCancel: VoidFunction;
};

export default function UserModal({
  title,
  show,
  formValue,
  onOk,
  onCancel,
}: UserModalProps) {
  const form = useForm<UserInfo>({
    defaultValues: formValue,
  });

  useEffect(() => {
    form.reset(formValue);
  }, [formValue, form]);

  const onSubmit = (values: UserInfo) => {
    console.log("onSubmit");

    onOk(values);
  };

  const onHeaderImgChange = (fileUrl: string) => {
    form.setValue("header_img", fileUrl);
  };

  return (
    <Dialog open={show} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="header_img"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar</FormLabel>
                  <FormControl>
                    <UploadAvatar
                      defaultAvatar={field.value}
                      onHeaderImgChange={onHeaderImgChange}
                      action={`${import.meta.env.VITE_APP_BASE_API}${
                        UploadApi.Single
                      }`}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
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
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nick_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NickName</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
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
