import configService from "@/api/services/configService";
import { useCallback, useEffect, useState } from "react";

type MapByTypeResult = { [key: string]: string };

export function useMapBySystemConfig(): MapByTypeResult {
	const [data, setData] = useState<MapByTypeResult>({});

	const getData = useCallback(async () => {
		const response = await configService.getConfigBySystem();
		const result = response.reduce((acc: MapByTypeResult, cur) => {
			acc[cur.config_key] = cur.config_value;
			return acc;
		}, {});
		setData(result);
	}, []);

	useEffect(() => {
		getData();
	}, [getData]);

	return data;
}
