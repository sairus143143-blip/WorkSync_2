import { format } from 'date-fns';
import type { Task } from '../types/tasks';
import type { TaskReportPeriod } from '../types/progressReports';

export function currentDateOnly(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

function addCalendarDays(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

/** Builds consecutive, inclusive seven-day windows anchored to the task start date. */
export function getTaskReportPeriods(task: Task): TaskReportPeriod[] {
  if (!task.startDate || !task.dueDate || task.startDate > task.dueDate) return [];
  const completionDate = task.status === 'completed' && task.completedAt
    ? task.completedAt.slice(0, 10)
    : task.dueDate;
  const finalDate = completionDate < task.dueDate ? completionDate : task.dueDate;
  const periods: TaskReportPeriod[] = [];
  let startDate = task.startDate;
  while (startDate <= finalDate) {
    const seventhDay = addCalendarDays(startDate, 6);
    const endDate = seventhDay < finalDate ? seventhDay : finalDate;
    periods.push({
      id: `${task.id}:${startDate}`,
      taskId: task.id,
      startDate,
      endDate,
      dueDate: endDate
    });
    startDate = addCalendarDays(endDate, 1);
  }
  return periods;
}

export function isPeriodElapsed(period: TaskReportPeriod, today = currentDateOnly()): boolean {
  return period.endDate <= today;
}

export function reportPeriodLabel(period: Pick<TaskReportPeriod, 'startDate' | 'endDate'>): string {
  return period.startDate === period.endDate ? period.startDate : `${period.startDate} – ${period.endDate}`;
}