import { Card } from "antd";

import { useState } from "react";

import { useTranslation } from "react-i18next";
import DictionaryDetailList from "./detail";
import DictionaryList from "./dictionary";

const App: React.FC = () => {
	const [selectedDictId, setSelectedDictId] = useState<number | null>(null);
	const { t } = useTranslation();
	return (
		<div className="flex w-full gap-4">
			<div className="w-1/4 pr-2">
				<Card title={t("sys.menu.system.dictionary_group")}>
					<DictionaryList onSelect={setSelectedDictId} />
				</Card>
			</div>
			<div className="w-3/4 pl-2">
				<Card title={t("sys.menu.system.dictionary")}>
					<DictionaryDetailList selectedDictId={selectedDictId} />
				</Card>
			</div>
		</div>
	);
};

export default App;
