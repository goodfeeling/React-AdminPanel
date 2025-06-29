import userService from "@/api/services/userService";
import { useLoginStateContext } from "@/pages/sys/login/providers/login-provider";
import { useRouter } from "@/routes/hooks";
import { useUserActions, useUserInfo } from "@/store/userStore";
import { Button } from "@/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router";

const { VITE_APP_HOMEPAGE: HOMEPAGE } = import.meta.env;

/**
 * Account Dropdown
 */
export default function AccountDropdown() {
	const { replace } = useRouter();
	const { user_name, email, header_img } = useUserInfo();
	const { clearUserInfoAndToken } = useUserActions();
	const { backToLogin } = useLoginStateContext();
	const { t } = useTranslation();

	const logoutMutation = useMutation({
		mutationFn: userService.logout,
		onSuccess: () => {
			clearUserInfoAndToken();
			replace("/auth/login");
		},
		onError: (error) => {
			console.error("Logout failed:", error);
			clearUserInfoAndToken(); // 即使失败也清理状态
			replace("/auth/login");
		},
	});

	const handleLogout = () => {
		logoutMutation.mutate();
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="rounded-full">
					<img className="h-6 w-6 rounded-full" src={header_img} alt="" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56">
				<div className="flex items-center gap-2 p-2">
					<img className="h-10 w-10 rounded-full" src={header_img} alt="" />
					<div className="flex flex-col items-start">
						<div className="text-text-primary text-sm font-medium">{user_name}</div>
						<div className="text-text-secondary text-xs">{email}</div>
					</div>
				</div>
				<DropdownMenuSeparator />

				<DropdownMenuItem asChild>
					<NavLink to="/management/user/account">{t("sys.menu.user.account")}</NavLink>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem className="font-bold text-warning" onClick={handleLogout}>
					{t("sys.login.logout")}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
