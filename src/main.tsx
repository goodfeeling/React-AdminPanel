// main.tsx
import "./global.css";
import "./theme/theme.css";
import "./locales/i18n";

import React, { Suspense, useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { Navigate, Outlet, RouterProvider, createHashRouter } from "react-router";
import App from "./App";
import { registerLocalIcons } from "./components/icon";
import { LineLoading } from "./components/loading";
import DashboardLayout from "./layouts/dashboard";
import PageError from "./pages/sys/error/PageError";
import AuthGuard from "./routes/components/auth-guard";
import useAppMenu from "./routes/hooks/use-menu"; // ✅ 引入你的 useMenu Hook
import { authRoutes } from "./routes/sections/auth";
import { buildRoutes, convertMenuTreeUserGroupToMenus } from "./routes/sections/buildRoutes";
import { mainRoutes } from "./routes/sections/main";
import type { Menu } from "./types/entity";

// 创建路由函数
function createAppRouter(menuData: Menu[]) {
	console.log(menuData, "=====");

	const routesSection = buildRoutes(menuData);

	return createHashRouter([
		{
			Component: () => (
				<App>
					<Outlet />
				</App>
			),
			errorElement: <ErrorBoundary fallbackRender={PageError} />,
			children: [
				{
					path: "/",
					element: (
						<AuthGuard>
							<Suspense fallback={<LineLoading />}>
								<DashboardLayout />
							</Suspense>
						</AuthGuard>
					),
					children: [
						{
							index: true,
							element: <Navigate to="/dashboard/workbench" replace />,
						},
						...routesSection,
					],
				},
				...authRoutes,
				...mainRoutes,
			],
		},
	]);
}

// 顶层组件，用于处理异步数据加载
function AppWrapper() {
	const { menuData, loading, error } = useAppMenu();
	const [router, setRouter] = useState<any>(null);
	useEffect(() => {
		if (Array.isArray(menuData) && menuData.length > 0) {
			const newRouter = createAppRouter(convertMenuTreeUserGroupToMenus(menuData));
			setRouter(newRouter);
		}
	}, [menuData]);
	if (loading) {
		return <LineLoading />;
	}
	if (error) {
		return (
			<PageError
				error={undefined}
				resetErrorBoundary={(): void => {
					throw new Error("Function not implemented.");
				}}
			/>
		);
	}
	if (!router) {
		return null;
	}
	return <RouterProvider router={router} />;
}
// 入口函数
async function initApp() {
	await registerLocalIcons();

	ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
		<React.StrictMode>
			<AppWrapper />
		</React.StrictMode>,
	);
}

initApp();
