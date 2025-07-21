import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/dialog";

import { useEffect } from "react";
export type SwitchRoleModalProps = {
	title: string;
	show: boolean;
	onCancel: VoidFunction;
};

export default function SwitchModal({ title, show, onCancel }: SwitchRoleModalProps) {
	useEffect(() => {}, []);

	return (
		<Dialog open={show} onOpenChange={(open) => !open && onCancel()}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}
