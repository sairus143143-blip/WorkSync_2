import React from 'react';
import { MoreHorizontalIcon } from 'lucide-react';
import type { TaskRow } from '../../types/tasks';
import { formatTaskDate } from '../../utils/tasks';
import { ProgressBar } from '../ui/ProgressBar';
import { Dropdown } from '../ui/Dropdown';
import { TaskDeadlineIndicators, TaskPriorityBadge } from './TaskBadges';

export interface TaskCardActions {
  onView: (row: TaskRow) => void;
  onEdit: (row: TaskRow) => void;
  onChangeStatus: (row: TaskRow) => void;
  onUpdateProgress: (row: TaskRow) => void;
  onReassign: (row: TaskRow) => void;
  onMoveTo?: (row: TaskRow, status: import('../../types/tasks').TaskStatus) => void;
}

export function TaskCard({ row, actions }: { row: TaskRow; actions: TaskCardActions }) {
  const moveItems = actions.onMoveTo ?
    (['todo', 'in_progress', 'in_review', 'completed', 'blocked'] as const).
      filter((s) => s !== row.task.status).
      map((s) => ({
        id: `move-${s}`,
        label: `Move to ${s.replace('_', ' ')}`,
        onSelect: () => actions.onMoveTo!(row, s)
      })) :
    [];

  return (
    <article className="rounded-xl border border-line bg-surface p-3 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => actions.onView(row)}
            className="block max-w-full truncate text-left text-sm font-medium text-ink hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
            
            {row.task.title}
          </button>
          <p className="text-[13px] tabular-nums text-muted">{row.task.taskCode}</p>
        </div>
        <Dropdown
          trigger={<MoreHorizontalIcon className="h-4 w-4 text-muted" />}
          triggerLabel={`Actions for ${row.task.title}`}
          align="end"
          items={[
            { id: 'view', label: 'View Details', onSelect: () => actions.onView(row) },
            { id: 'edit', label: 'Edit Task', onSelect: () => actions.onEdit(row) },
            { id: 'status', label: 'Change Status', onSelect: () => actions.onChangeStatus(row) },
            { id: 'progress', label: 'Update Progress', onSelect: () => actions.onUpdateProgress(row) },
            { id: 'reassign', label: 'Reassign', onSelect: () => actions.onReassign(row) },
            ...moveItems.map((item, i) => ({ ...item, separatorBefore: i === 0 && moveItems.length > 0 }))
          ]} />
        
      </div>
      <div className="mt-3 space-y-1.5 text-[13px] text-muted">
        <p className="truncate">{row.project.name}</p>
        <p className="truncate">{row.employeeName}</p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <TaskPriorityBadge priority={row.task.priority} />
          <span className="tabular-nums">Due {formatTaskDate(row.task.dueDate, 'MMM d')}</span>
        </div>
        <TaskDeadlineIndicators overdue={row.overdue} dueToday={row.dueToday} dueSoon={row.dueSoon} />
        <div className="flex items-center gap-2 pt-1">
          <ProgressBar value={row.task.progress} size="sm" label={`${row.task.title} progress`} className="flex-1" />
          <span className="w-9 shrink-0 text-right text-xs font-medium tabular-nums">{row.task.progress}%</span>
        </div>
      </div>
    </article>
  );
}
