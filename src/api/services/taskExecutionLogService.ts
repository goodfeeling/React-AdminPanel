import task_execution_logClient from "../apiClient";

import type { PageList, TaskExecutionLog } from "#/entity";

export enum TaskExecutionLogClient {
	TaskExecutionLog = "/task_execution_log",
	SearchTaskExecutionLog = "/task_execution_log/search",
	WsUri = "/ws/scheduleLog",
}

const searchPageList = (searchStr: string) =>
	task_execution_logClient.get<PageList<TaskExecutionLog>>({
		url: `${TaskExecutionLogClient.SearchTaskExecutionLog}?${searchStr}`,
	});

export default {
	searchPageList,
};
