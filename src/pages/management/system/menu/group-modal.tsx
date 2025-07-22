import { BasicStatus } from "@/types/enum";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/ui/form";
import { Input } from "@/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/ui/toggle-group";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { MenuGroup } from "#/entity";

export type MenuGroupModalProps = {
	formValue: MenuGroup;
	title: string;
	show: boolean;
	onOk: (values: MenuGroup) => void;
	onCancel: VoidFunction;
};

export default function UserModal({ title, show, formValue, onOk, onCancel }: MenuGroupModalProps) {
	const form = useForm<MenuGroup>({
		defaultValues: formValue,
	});

	useEffect(() => {
		form.reset(formValue);
	}, [formValue, form]);

	const onSubmit = (values: MenuGroup) => {
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
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
								</FormItem>
							)}
						/>
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
