import task_execution_logClient from "../apiClient";

import type { PageList, TaskExecutionLog } from "#/entity";

export enum TaskExecutionLogClient {
	TaskExecutionLog = "/task_execution_log",
	SearchTaskExecutionLog = "/task_execution_log/search",
	DeleteBatch = "/task_execution_log/batch",
}
const getTaskExecutionLogs = () =>
	task_execution_logClient.get<TaskExecutionLog[]>({
		url: `${TaskExecutionLogClient.TaskExecutionLog}`,
	});
const updateTaskExecutionLog = (id: number, task_execution_logInfo: TaskExecutionLog) =>
	task_execution_logClient.put<TaskExecutionLog>({
		url: `${TaskExecutionLogClient.TaskExecutionLog}/${id}`,
		data: task_execution_logInfo,
	});

const createTaskExecutionLog = (task_execution_logInfo: TaskExecutionLog) =>
	task_execution_logClient.post<TaskExecutionLog>({
		url: `${TaskExecutionLogClient.TaskExecutionLog}`,
		data: task_execution_logInfo,
	});

const searchPageList = (searchStr: string) =>
	task_execution_logClient.get<PageList<TaskExecutionLog>>({
		url: `${TaskExecutionLogClient.SearchTaskExecutionLog}?${searchStr}`,
	});

const deleteTaskExecutionLog = (id: number) =>
	task_execution_logClient.delete<string>({
		url: `${TaskExecutionLogClient.TaskExecutionLog}/${id}`,
	});

const deleteBatch = (ids: number[]) =>
	task_execution_logClient.post<number>({
		url: `${TaskExecutionLogClient.DeleteBatch}`,
		data: { ids },
	});

export default {
	updateTaskExecutionLog,
	searchPageList,
	createTaskExecutionLog,
	deleteTaskExecutionLog,
	getTaskExecutionLogs,
	deleteBatch,
};
