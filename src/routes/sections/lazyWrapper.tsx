import { Suspense } from "react";
import type { ComponentType, LazyExoticComponent, ReactNode } from "react";

export function lazyLoad(Component: LazyExoticComponent<ComponentType<any>>): ReactNode {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<Component />
		</Suspense>
	);
}
