import { UploadApi } from "@/api/services/uploadService";
import { Upload } from "@/components/upload";
import useUserStore from "@/store/userStore";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/ui/toggle-group";
import { Switch } from "antd";
import type { UploadFile } from "antd/lib";
import { type ReactNode, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { DictionaryDetail } from "#/entity";

export type DictionaryDetailModalProps = {
	formValue: DictionaryDetail;
	title: string;
	show: boolean;
	onOk: (values: DictionaryDetail) => void;
	onCancel: VoidFunction;
};

export default function UserModal({ title, show, formValue, onOk, onCancel }: DictionaryDetailModalProps) {
	const form = useForm<DictionaryDetail>({
		defaultValues: formValue,
	});
	const { userToken } = useUserStore.getState();
	const onSubmit = (values: DictionaryDetail) => {
		values.sort = Number(values.sort);
		onOk(values);
	};
	const [fileList, setFileList] = useState<UploadFile[]>([]);

	useEffect(() => {
		form.reset(formValue);
		// 初始化文件列表状态 - 如果有现有的图片URL，则创建一个文件对象用于回显
		if (formValue.type === "image" && formValue.value && typeof formValue.value === "string") {
			const existingFile: UploadFile = {
				uid: "-1",
				name: "image.png",
				status: "done",
				url: formValue.value,
			};
			setFileList([existingFile]);
		} else {
			setFileList([]);
		}
	}, [formValue, form]);

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
							name="type"
							render={({ field }) => (
								<FormItem>
									<FormLabel>type</FormLabel>
									<FormControl>
										<Select
											onValueChange={(value) => {
												field.onChange(value);
												form.setValue("value", "");
											}}
											value={field.value}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select type" />
											</SelectTrigger>
											<SelectContent>
												{[
													{ value: "string", label: "字符串" },
													{ value: "number", label: "数字" },
													{ value: "image", label: "图片" },
													{ value: "icon", label: "图标" },
												].map((item) => {
													return (
														<SelectItem value={item.value} key={item.value}>
															<Badge variant="success">{item.label}</Badge>
														</SelectItem>
													);
												})}
											</SelectContent>
										</Select>
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="value"
							render={({ field }) => {
								let result: ReactNode;

								switch (form.watch("type") || form.getValues().type) {
									case "string":
										result = <Input {...field} />;
										break;
									case "number":
										result = <Input type="number" {...field} />;
										break;
									case "boolean":
										result = (
											<div className="w-fit">
												<Switch checked={Boolean(field.value)} onChange={(value) => field.onChange(value)} />
											</div>
										);
										break;

									case "image":
										result = (
											<Card title="Upload Single File">
												<CardContent>
													<Upload
														maxCount={1}
														fileList={fileList}
														name="file"
														action={`${import.meta.env.VITE_APP_BASE_API}${UploadApi.Single}`}
														headers={{
															Authorization: `Bearer ${userToken?.accessToken}`,
														}}
														onChange={(info) => {
															const { file } = info;

															// 检查文件是否上传成功
															if (file.status === "done" && file.response) {
																// 假设服务器返回的文件URL在 file.response.url 中
																const fileUrl = file.response.data.file_url || "";
																field.onChange(fileUrl);
																setFileList([file]);
															} else if (file.status === "removed") {
																// 文件被移除时更新状态
																field.onChange("");
																setFileList([]);
															} else if (file.status === "error") {
																setFileList([file]);
															} else {
																// 上传过程中更新文件列表
																setFileList([file]);
															}
														}}
													/>
												</CardContent>
											</Card>
										);
										break;
									default:
										result = <Input {...field} />;
								}
								return (
									<FormItem>
										<FormLabel>value</FormLabel>
										<FormControl>{result}</FormControl>
									</FormItem>
								);
							}}
						/>
						<FormField
							control={form.control}
							name="extend"
							render={({ field }) => (
								<FormItem>
									<FormLabel>extend</FormLabel>
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
											value={String(field.value)}
											onValueChange={(value) => {
												field.onChange(Number(value));
											}}
										>
											<ToggleGroupItem value="1">Enable</ToggleGroupItem>
											<ToggleGroupItem value="2">Disable</ToggleGroupItem>
										</ToggleGroup>
									</FormControl>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="sort"
							render={({ field }) => (
								<FormItem>
									<FormLabel>sort</FormLabel>
									<FormControl>
										<Input type="number" {...field} />
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
