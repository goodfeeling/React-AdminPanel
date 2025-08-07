import { UploadApi } from "@/api/services/uploadService";
import userService from "@/api/services/userService";
import { UploadAvatar } from "@/components/upload";
import RoleSelect from "@/pages/components/role-select/RoleSelect";
import useUserStore from "@/store/userStore";
import type { UserInfo } from "@/types/entity";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/ui/form";
import { Input } from "@/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/ui/toggle-group";
import { Button, Modal } from "antd";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { BasicStatus } from "#/enum";

export type UserModalProps = {
	formValue: UserInfo;
	treeData: any[];
	title: string;
	show: boolean;
	onOk: (values: UserInfo) => Promise<boolean>;
	onCancel: VoidFunction;
};

const UserNewModal = ({ title, show, formValue, treeData, onOk, onCancel }: UserModalProps) => {
	const [loading, setLoading] = useState(false);
	const [open, setOpen] = useState(false);
	const { userToken } = useUserStore.getState();
	const form = useForm<UserInfo>({
		defaultValues: formValue,
	});

	useEffect(() => {
		setOpen(show);
	}, [show]);

	useEffect(() => {
		form.reset(formValue);
	}, [formValue, form]);

	const handleOk = async () => {
		const values = form.getValues();
		setLoading(true);
		const res = await onOk(values);
		if (res) {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		setOpen(false);
		onCancel();
	};

	return (
		<>
			<Modal
				open={open}
				title={title}
				onOk={handleOk}
				onCancel={handleCancel}
				centered
				footer={[
					<Button key="back" onClick={handleCancel}>
						Return
					</Button>,
					<Button key="submit" type="primary" loading={loading} onClick={handleOk}>
						Submit
					</Button>,
				]}
			>
				<Form {...form}>
					<form className="space-y-4">
						<FormField
							control={form.control}
							name="header_img"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Avatar</FormLabel>
									<FormControl>
										<UploadAvatar
											defaultAvatar={field.value}
											onHeaderImgChange={(fileUrl: string) => {
												form.setValue("header_img", fileUrl);
											}}
											action={`${import.meta.env.VITE_APP_BASE_API}${UploadApi.Single}`}
											headers={{
												Authorization: `Bearer ${userToken?.accessToken}`,
											}}
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
							name="roles"
							render={({ field }) => (
								<FormItem>
									<FormLabel>角色</FormLabel>
									<FormControl>
										<RoleSelect
											roles={field.value ?? []}
											treeData={treeData}
											recordId={form.getValues().id}
											onChange={async (values) => {
												try {
													await userService.bindRole(form.getValues().id, values);
													console.log("更新成功");
												} catch (error) {
													console.error("更新失败:", error);
												}
											}}
										/>
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
											<ToggleGroupItem value={String(BasicStatus.ENABLE)}>Enable</ToggleGroupItem>
											<ToggleGroupItem value={String(BasicStatus.DISABLE)}>Disable</ToggleGroupItem>
										</ToggleGroup>
									</FormControl>
								</FormItem>
							)}
						/>
					</form>
				</Form>
			</Modal>
		</>
	);
};

export default UserNewModal;
