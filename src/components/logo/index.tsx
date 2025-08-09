import { useMapByType } from "@/hooks";
import { useTheme } from "@/theme/hooks";
import { cn } from "@/utils";
import { NavLink } from "react-router";
import { Icon } from "../icon";

interface Props {
	size?: number | string;
	className?: string;
}
function Logo({ size = 50, className }: Props) {
	const { themeTokens } = useTheme();
	const siteConfig = useMapByType("site_config");

	if (
		siteConfig.site_logo?.endsWith(".svg") ||
		siteConfig.site_logo?.endsWith(".png") ||
		siteConfig.site_logo?.endsWith(".jpg")
	) {
		// 显示网络SVG图片
		return (
			<NavLink to="/" className={cn(className)}>
				<img src={siteConfig.site_logo} alt="Logo" style={{ width: size, height: size }} />
			</NavLink>
		);
	}
	return (
		<NavLink to="/" className={cn(className)}>
			<Icon icon="solar:code-square-bold" color={themeTokens.color.palette.primary.default} size={size} />
		</NavLink>
	);
}

export default Logo;
