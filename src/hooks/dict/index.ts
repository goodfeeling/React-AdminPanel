import dictionaryService from "@/api/services/dictionaryService";
import type { DictionaryDetail } from "@/types/entity";
import { useCallback, useEffect, useState } from "react";
export default function useDictionaryByType(typeText: string): DictionaryDetail[] {
	const [data, setData] = useState<DictionaryDetail[]>([]);

	const getData = useCallback(async () => {
		const response = await dictionaryService.getByType(typeText);
		setData(response.details);
	}, [typeText]);

	useEffect(() => {
		getData();
	}, [getData]);

	return data;
}
type MapByTypeResult = { [key: string]: string };

export function useMapByType(typeText: string): MapByTypeResult {
	const [data, setData] = useState<MapByTypeResult>({});

	const getData = useCallback(async () => {
		const response = await dictionaryService.getByType(typeText);
		const result = response.details.reduce((acc: MapByTypeResult, cur) => {
			acc[cur.label] = cur.value;
			return acc;
		}, {});
		setData(result);
	}, [typeText]);

	useEffect(() => {
		getData();
	}, [getData]);

	return data;
}
