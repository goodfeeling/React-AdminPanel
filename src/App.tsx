import { QueryClientProvider } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { MotionLazy } from "./components/animate/motion-lazy";
import { RouteLoadingProgress } from "./components/loading";
import Toast from "./components/toast";
import { AntdAdapter } from "./theme/adapter/antd.adapter";
import { ThemeProvider } from "./theme/theme-provider";
import "@ant-design/v5-patch-for-react-19";
import { AliveScope } from "react-activation";
import { useMapByType } from "./hooks";
function App({ children }: { children: React.ReactNode }) {
	const siteConfig = useMapByType("site_config");

	return (
		<HelmetProvider>
			<QueryClientProvider client={new QueryClient()}>
				<ThemeProvider adapters={[AntdAdapter]}>
					<AliveScope>
						<VercelAnalytics />
						<Helmet>
							<title>{siteConfig.site_name}</title>
							<link rel="icon" href={siteConfig.site_logo} />
						</Helmet>
						<Toast />
						<RouteLoadingProgress />
						<MotionLazy>{children}</MotionLazy>
					</AliveScope>
				</ThemeProvider>
			</QueryClientProvider>
		</HelmetProvider>
	);
}

export default App;
