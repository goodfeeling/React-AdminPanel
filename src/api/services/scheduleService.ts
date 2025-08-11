import schedule_taskClient from "../apiClient";

import type { PageList, ScheduledTask } from "#/entity";

export enum ScheduledTaskClient {
	ScheduledTask = "/scheduled_task",
	SearchScheduledTask = "/scheduled_task/search",
	DeleteBatch = "/scheduled_task/batch",
}
const getScheduledTasks = () =>
	schedule_taskClient.get<ScheduledTask[]>({
		url: `${ScheduledTaskClient.ScheduledTask}`,
	});
const updateScheduledTask = (id: number, schedule_taskInfo: ScheduledTask) =>
	schedule_taskClient.put<ScheduledTask>({
		url: `${ScheduledTaskClient.ScheduledTask}/${id}`,
		data: schedule_taskInfo,
	});

const createScheduledTask = (schedule_taskInfo: ScheduledTask) =>
	schedule_taskClient.post<ScheduledTask>({
		url: `${ScheduledTaskClient.ScheduledTask}`,
		data: schedule_taskInfo,
	});

const searchPageList = (searchStr: string) =>
	schedule_taskClient.get<PageList<ScheduledTask>>({
		url: `${ScheduledTaskClient.SearchScheduledTask}?${searchStr}`,
	});

const deleteScheduledTask = (id: number) =>
	schedule_taskClient.delete<string>({
		url: `${ScheduledTaskClient.ScheduledTask}/${id}`,
	});

const deleteBatch = (ids: number[]) =>
	schedule_taskClient.post<number>({
		url: `${ScheduledTaskClient.DeleteBatch}`,
		data: { ids },
	});

export default {
	updateScheduledTask,
	searchPageList,
	createScheduledTask,
	deleteScheduledTask,
	getScheduledTasks,
	deleteBatch,
};
