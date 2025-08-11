import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { FormControl, FormField, FormItem, FormLabel } from "@/ui/form";
import { Input } from "@/ui/input";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import type { ScheduledTask } from "#/entity";

const AdvancedCronField = () => {
	const { control, setValue } = useFormContext<ScheduledTask>();
	const [showBuilder, setShowBuilder] = useState(false);

	// Cron各部分的选项
	// const seconds = Array.from({ length: 60 }, (_, i) => i.toString());
	// const minutes = Array.from({ length: 60 }, (_, i) => i.toString());
	// const hours = Array.from({ length: 24 }, (_, i) => i.toString());
	// const days = Array.from({ length: 32 }, (_, i) => (i === 0 ? "?" : i.toString()));
	// const months = Array.from({ length: 13 }, (_, i) => (i === 0 ? "*" : i.toString()));
	// const weeks = ["*", "MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

	// 简化的 cron 构建器状态
	const [cronParts, setCronParts] = useState({
		second: "0",
		minute: "0",
		hour: "12",
		day: "*",
		month: "*",
		week: "?",
	});

	const generateCronExpression = () => {
		return `${cronParts.second} ${cronParts.minute} ${cronParts.hour} ${cronParts.day} ${cronParts.month} ${cronParts.week}`;
	};

	const applyCronExpression = () => {
		const expression = generateCronExpression();
		setValue("cron_expression", expression);
		setShowBuilder(false);
	};

	return (
		<FormField
			control={control}
			name="cron_expression"
			render={({ field, fieldState }) => (
				<FormItem>
					<FormLabel>Cron表达式</FormLabel>
					<FormControl>
						<div className="space-y-4">
							<div className="flex gap-2">
								<Input {...field} placeholder="请输入cron表达式，例如: 0 0 12 * * ?" />
								<Button type="button" variant="outline" onClick={() => setShowBuilder(!showBuilder)}>
									{showBuilder ? "隐藏构建器" : "显示构建器"}
								</Button>
							</div>

							{showBuilder && (
								<Card>
									<CardHeader>
										<CardTitle className="text-lg">Cron表达式构建器</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="grid grid-cols-2 md:grid-cols-6 gap-4">
											<div>
												<FormLabel htmlFor="cron-second" className="text-sm font-medium">
													秒
												</FormLabel>

												<Input
													value={cronParts.second}
													onChange={(e) =>
														setCronParts({
															...cronParts,
															second: e.target.value,
														})
													}
													placeholder="0"
												/>
											</div>
											<div>
												<FormLabel htmlFor="cron-minute" className="text-sm font-medium">
													分
												</FormLabel>
												<Input
													value={cronParts.minute}
													onChange={(e) =>
														setCronParts({
															...cronParts,
															minute: e.target.value,
														})
													}
													placeholder="0"
												/>
											</div>
											<div>
												<FormLabel htmlFor="cron-hour" className="text-sm font-medium">
													时
												</FormLabel>
												<Input
													value={cronParts.hour}
													onChange={(e) => setCronParts({ ...cronParts, hour: e.target.value })}
													placeholder="12"
												/>
											</div>
											<div>
												<FormLabel htmlFor="cron-day" className="text-sm font-medium">
													日
												</FormLabel>

												<Input
													value={cronParts.day}
													onChange={(e) => setCronParts({ ...cronParts, day: e.target.value })}
													placeholder="*"
												/>
											</div>
											<div>
												<FormLabel htmlFor="cron-month" className="text-sm font-medium">
													月
												</FormLabel>
												<Input
													value={cronParts.month}
													onChange={(e) =>
														setCronParts({
															...cronParts,
															month: e.target.value,
														})
													}
													placeholder="*"
												/>
											</div>
											<div>
												<FormLabel htmlFor="cron-week" className="text-sm font-medium">
													周
												</FormLabel>
												<Input
													value={cronParts.week}
													onChange={(e) => setCronParts({ ...cronParts, week: e.target.value })}
													placeholder="?"
												/>
											</div>
										</div>

										<div className="flex justify-between items-center">
											<div className="text-sm p-2 bg-muted rounded">生成的表达式: {generateCronExpression()}</div>
											<Button type="button" onClick={applyCronExpression}>
												应用表达式
											</Button>
										</div>
									</CardContent>
								</Card>
							)}

							{fieldState.error ? <p className="text-sm text-red-500">{fieldState.error.message}</p> : null}

							<div className="text-sm text-muted-foreground space-y-1">
								<p>Cron表达式格式: 秒 分 时 日 月 周</p>
								<p>例如: "0 0 12 * * ?" 表示每天中午12点触发</p>
								<p>通配符说明: * (每), ? (不指定), / (间隔), - (范围), , (多个值)</p>
							</div>
						</div>
					</FormControl>
				</FormItem>
			)}
		/>
	);
};

export default AdvancedCronField;
