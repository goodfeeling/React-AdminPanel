import dictionaryService from "@/api/services/dictionaryService";
import type { DictionaryDetail } from "@/types/entity";
import { useCallback, useEffect, useState } from "react";

// ----------------------------------------------------------------------

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
