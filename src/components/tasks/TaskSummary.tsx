import React from 'react';
import {
  BanIcon,
  CircleCheckIcon,
  CircleDashedIcon,
  EyeIcon,
  ListTodoIcon,
  CirclePlayIcon,
  TriangleAlertIcon
} from 'lucide-react';
import type { Task } from '../../types/tasks';
import { summarizeTasks } from '../../utils/tasks';
import { StatCard } from '../ui/StatCard';

export function TaskSummary({ tasks }: { tasks: Task[] }) {
  const s = summarizeTasks(tasks);
  return (
    <section aria-label="Task summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      <StatCard label="Total Tasks" value={String(s.total)} icon={ListTodoIcon} tone="neutral" hint="All tasks" />
      <StatCard label="To Do" value={String(s.todo)} icon={CircleDashedIcon} tone="neutral" />
      <StatCard label="In Progress" value={String(s.in_progress)} icon={CirclePlayIcon} tone="primary" />
      <StatCard label="In Review" value={String(s.in_review)} icon={EyeIcon} tone="info" />
      <StatCard label="Completed" value={String(s.completed)} icon={CircleCheckIcon} tone="success" />
      <StatCard label="Blocked" value={String(s.blocked)} icon={BanIcon} tone={s.blocked > 0 ? 'danger' : 'neutral'} />
      <StatCard label="Overdue" value={String(s.overdue)} icon={TriangleAlertIcon} tone={s.overdue > 0 ? 'danger' : 'neutral'} />
    </section>
  );
}
