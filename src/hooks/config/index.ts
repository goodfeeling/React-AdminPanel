import configService from "@/api/services/configService";
import { useQuery } from "@tanstack/react-query";

type MapByTypeResult = { [key: string]: string };

export function useMapBySystemConfig() {
	return useQuery({
		queryKey: ["sysConfig"],
		queryFn: () => configService.getConfigBySystem(),
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 30,
		select: (data) => {
			const result = data.reduce((acc: MapByTypeResult, cur) => {
				acc[cur.config_key] = cur.config_value;
				return acc;
			}, {});
			return result;
		},
	});
}
