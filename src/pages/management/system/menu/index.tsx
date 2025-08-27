import { Card } from "antd";
import { useState } from "react";

import { useTranslation } from "react-i18next";
import MenuList from "./base";
import MenuGroupList from "./group";

const App: React.FC = () => {
	const [selectedId, setSelectedId] = useState<number | null>(null);
	const { t } = useTranslation();
	return (
		<div className="flex w-full gap-4">
			<div className="w-1/4 pr-2">
				<Card title={t("sys.menu.system.menu_group")}>
					<MenuGroupList onSelect={setSelectedId} />
				</Card>
			</div>
			<div className="w-3/4 pl-2">
				<Card title={t("sys.menu.system.menu")}>
					<MenuList selectedId={selectedId} />
				</Card>
			</div>
		</div>
	);
};

export default App;
