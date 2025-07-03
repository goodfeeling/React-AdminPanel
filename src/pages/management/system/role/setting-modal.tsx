import { Icon } from "@/components/icon";
import { Dialog, DialogContent, DialogHeader } from "@/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

export type SettingValue = {
  id: string;
};

export type SettingModalProps = {
  formValue: SettingValue;
  title: string;
  show: boolean;
  onOk: (values: SettingValue) => void;
  onCancel: VoidFunction;
};
export default function SettingModal({
  title,
  show,
  formValue,
  onOk,
  onCancel,
}: SettingModalProps) {
  console.log(title, show, formValue, onOk, onCancel);

  return (
    <Dialog>
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
          <TabsContent value="1">1</TabsContent>
          <TabsContent value="2">2</TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
