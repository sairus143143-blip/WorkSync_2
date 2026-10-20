import React from 'react';
import type { TaskRow, TaskStatus } from '../../types/tasks';
import { taskStatusLabels } from '../../utils/tasks';
import { TaskCard, type TaskCardActions } from './TaskCard';

const columns: TaskStatus[] = ['todo', 'in_progress', 'in_review', 'completed', 'blocked'];

interface TaskBoardProps {
  rows: TaskRow[];
  actions: TaskCardActions;
}

export function TaskBoard({ rows, actions }: TaskBoardProps) {
  const boardActions: TaskCardActions = {
    ...actions,
    onMoveTo:
  actions.onMoveTo ??
  ((row, status) =>
    actions.onChangeStatus({
      ...row,
      task: { ...row.task, status },
    })),
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {columns.map((status) => {
        const columnRows = rows.filter((r) => r.task.status === status);
        return (
          <section key={status} aria-label={taskStatusLabels[status]} className="min-w-[260px] flex-1 rounded-xl border border-line bg-bg/50 p-3">
            <header className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-ink">{taskStatusLabels[status]}</h3>
              <span className="rounded-md bg-surface px-2 py-0.5 text-xs tabular-nums text-muted">{columnRows.length}</span>
            </header>
            <div className="space-y-3">
              {columnRows.map((row) =>
                <TaskCard key={row.task.id} row={row} actions={boardActions} />
              )}
              {columnRows.length === 0 &&
                <p className="py-6 text-center text-[13px] text-subtle">No tasks</p>
              }
            </div>
          </section>
        );
      })}
    </div>
  );
}
