import Logo from "@/assets/images/logo.png";
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
import { useUserActions } from "@/store/userStore";
import { useEffect } from "react";
import { AliveScope } from "react-activation";
import { useNavigate } from "react-router";
import { setNavigateFunction, setUpdateToken } from "./api/apiClient";
function App({ children }: { children: React.ReactNode }) {
	const navigate = useNavigate();

	// token update to apiClient
	const tokenUpdater = () => {
		const { setUserToken } = useUserActions();
		setUpdateToken(setUserToken);
	};
	tokenUpdater();

	useEffect(() => {
		setNavigateFunction(navigate);
	}, [navigate]);

	return (
		<HelmetProvider>
			<QueryClientProvider client={new QueryClient()}>
				<ThemeProvider adapters={[AntdAdapter]}>
					<AliveScope>
						<VercelAnalytics />
						<Helmet>
							<title>My Admin</title>
							<link rel="icon" href={Logo} />
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
