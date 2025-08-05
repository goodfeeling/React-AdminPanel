import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Api, DictionaryDetail } from "#/entity";

export type ApiModalProps = {
	formValue: Api;
	apiGroup: DictionaryDetail[] | undefined;
	apiMethod: DictionaryDetail[] | undefined;
	title: string;
	show: boolean;
	onOk: (values: Api) => void;
	onCancel: VoidFunction;
};

export default function ApiModal({ title, show, formValue, apiGroup, apiMethod, onOk, onCancel }: ApiModalProps) {
	const form = useForm<Api>({
		defaultValues: formValue,
	});

	useEffect(() => {
		form.reset(formValue);
	}, [formValue, form]);

	const onSubmit = (values: Api) => {
		onOk(values);
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
							name="path"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Path</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="method"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Method</FormLabel>
									<Select
										onValueChange={(value) => {
											field.onChange(value);
										}}
										value={field.value}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select Method" />
										</SelectTrigger>
										<SelectContent>
											{apiMethod?.map((item) => {
												return (
													<SelectItem value={item.value} key={item.id}>
														<Badge variant="success">{item.label}</Badge>
													</SelectItem>
												);
											})}
										</SelectContent>
									</Select>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="api_group"
							render={({ field }) => (
								<FormItem>
									<FormLabel>ApiGroup</FormLabel>
									<Select
										onValueChange={(value) => {
											field.onChange(value);
										}}
										value={field.value}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select ApiGroup" />
										</SelectTrigger>
										<SelectContent>
											{apiGroup?.map((item) => {
												return (
													<SelectItem value={item.value} key={item.id}>
														<Badge variant="success">{item.label}</Badge>
													</SelectItem>
												);
											})}
										</SelectContent>
									</Select>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Input {...field} />
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
