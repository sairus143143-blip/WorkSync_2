import React from 'react';
import { MoreHorizontalIcon } from 'lucide-react';
import type { TaskRow, TaskSortKey } from '../../types/tasks';
import type { SortState } from '../../types/organization';
import { formatTaskDate } from '../../utils/tasks';
import { Avatar } from '../ui/Avatar';
import { Dropdown } from '../ui/Dropdown';
import { ProgressBar } from '../ui/ProgressBar';
import { Table, type TableColumn } from '../ui/Table';
import { TaskDeadlineIndicators, TaskPriorityBadge, TaskStatusBadge } from './TaskBadges';
import type { TaskCardActions } from './TaskCard';

interface TaskTableProps {
  rows: TaskRow[];
  sort: SortState<TaskSortKey>;
  onSort: (key: string) => void;
  actions: TaskCardActions;
}

export function TaskTable({ rows, sort, onSort, actions }: TaskTableProps) {
  const columns: TableColumn<TaskRow>[] = [
    {
      key: 'task',
      header: 'Task',
      sortKey: 'title',
      render: (r) =>
        <button
          type="button"
          onClick={() => actions.onView(r)}
          className="block min-w-[180px] max-w-[240px] rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
          
          <span className="block truncate font-medium text-ink hover:text-primary">{r.task.title}</span>
          <span className="block truncate text-[13px] tabular-nums text-muted">{r.task.taskCode}</span>
        </button>

    },
    {
      key: 'code',
      header: 'Task Code',
      hideBelow: 'lg',
      render: (r) => <span className="whitespace-nowrap tabular-nums text-muted">{r.task.taskCode}</span>
    },
    {
      key: 'project',
      header: 'Project',
      sortKey: 'project',
      render: (r) =>
        <div className="min-w-[160px]">
          <p className="truncate font-medium text-ink">{r.project.name}</p>
          <p className="truncate text-[13px] tabular-nums text-muted">{r.project.code}</p>
        </div>

    },
    {
      key: 'employee',
      header: 'Assigned Employee',
      sortKey: 'employee',
      render: (r) =>
        <div className="flex min-w-[190px] items-center gap-3">
          <Avatar name={r.employeeName} src={r.employee.avatar ?? undefined} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{r.employeeName}</p>
            <p className="truncate text-[13px] tabular-nums text-muted">{r.employee.employeeNumber}</p>
          </div>
        </div>

    },
    {
      key: 'priority',
      header: 'Priority',
      sortKey: 'priority',
      render: (r) => <TaskPriorityBadge priority={r.task.priority} />
    },
    {
      key: 'status',
      header: 'Status',
      sortKey: 'status',
      render: (r) =>
        <div className="space-y-1">
          <TaskStatusBadge status={r.task.status} />
          <TaskDeadlineIndicators overdue={r.overdue} dueToday={r.dueToday} dueSoon={r.dueSoon} />
        </div>

    },
    {
      key: 'start',
      header: 'Start Date',
      sortKey: 'startDate',
      hideBelow: 'md',
      render: (r) => <span className="whitespace-nowrap tabular-nums text-muted">{formatTaskDate(r.task.startDate)}</span>
    },
    {
      key: 'due',
      header: 'Due Date',
      sortKey: 'dueDate',
      render: (r) => <span className="whitespace-nowrap tabular-nums">{formatTaskDate(r.task.dueDate)}</span>
    },
    {
      key: 'progress',
      header: 'Progress',
      sortKey: 'progress',
      hideBelow: 'sm',
      render: (r) =>
        <div className="flex w-28 items-center gap-2">
          <ProgressBar value={r.task.progress} label={`${r.task.title} progress`} />
          <span className="w-9 shrink-0 text-right text-[13px] font-medium tabular-nums">{r.task.progress}%</span>
        </div>

    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (r) =>
        <Dropdown
          trigger={<MoreHorizontalIcon className="h-4 w-4 text-muted" />}
          triggerLabel={`Actions for ${r.task.title}`}
          align="end"
          items={[
            { id: 'view', label: 'View Details', onSelect: () => actions.onView(r) },
            { id: 'edit', label: 'Edit Task', onSelect: () => actions.onEdit(r) },
            { id: 'status', label: 'Change Status', onSelect: () => actions.onChangeStatus(r) },
            { id: 'progress', label: 'Update Progress', onSelect: () => actions.onUpdateProgress(r) },
            { id: 'reassign', label: 'Reassign', onSelect: () => actions.onReassign(r) }
          ]} />

    }
  ];

  return <Table caption="Tasks" columns={columns} rows={rows} getRowKey={(r) => r.task.id} sort={sort} onSort={onSort} />;
}
