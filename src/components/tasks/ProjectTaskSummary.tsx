import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import type { Task } from '../../types/tasks';
import { summarizeProjectTasks } from '../../utils/tasks';

export function ProjectTaskSummary({ projectId, tasks }: { projectId: string; tasks: Task[] }) {
  const s = summarizeProjectTasks(tasks, projectId);
  const items = [
    { label: 'Total Tasks', value: s.total },
    { label: 'To Do', value: s.todo },
    { label: 'In Progress', value: s.in_progress },
    { label: 'In Review', value: s.in_review },
    { label: 'Completed', value: s.completed },
    { label: 'Blocked', value: s.blocked },
    { label: 'Overdue', value: s.overdue }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) =>
          <div key={item.label} className="rounded-lg bg-bg px-3 py-2.5">
            <p className="text-xs text-muted">{item.label}</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-ink">{item.value}</p>
          </div>
        )}
      </div>
      <Link
        to={`/tasks?project=${projectId}`}
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
        
        View project tasks
        <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </div>
  );
}
