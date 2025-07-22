import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/ui/form";
import { Input } from "@/ui/input";

import { ToggleGroup, ToggleGroupItem } from "@/ui/toggle-group";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Dictionary } from "#/entity";

export type DictionaryModalProps = {
	formValue: Dictionary;
	title: string;
	show: boolean;
	onOk: (values: Dictionary) => void;
	onCancel: VoidFunction;
};

export default function UserModal({ title, show, formValue, onOk, onCancel }: DictionaryModalProps) {
	const form = useForm<Dictionary>({
		defaultValues: formValue,
	});

	useEffect(() => {
		form.reset(formValue);
	}, [formValue, form]);

	const onSubmit = (values: Dictionary) => {
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
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>name</FormLabel>
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
							name="desc"
							render={({ field }) => (
								<FormItem>
									<FormLabel>desc</FormLabel>
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
