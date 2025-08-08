import { Card } from "antd";
import { useState } from "react";

import MenuList from "./base";
import MenuGroupList from "./group";

const App: React.FC = () => {
	const [selectedId, setSelectedId] = useState<number | null>(null);

	return (
		<div className="flex w-full gap-4">
			<div className="w-1/4 pr-2">
				<Card title="Menu Group List">
					<MenuGroupList onSelect={setSelectedId} />
				</Card>
			</div>
			<div className="w-3/4 pl-2">
				<Card title="Menu List">
					<MenuList selectedId={selectedId} />
				</Card>
			</div>
		</div>
	);
};

export default App;
