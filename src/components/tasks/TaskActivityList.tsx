import React from 'react';
import type { TaskActivity } from '../../types/tasks';
import { formatActivityTime } from '../../utils/projects';

export function TaskActivityList({ activities }: { activities: TaskActivity[] }) {
  if (activities.length === 0) {
    return <p className="text-sm text-muted">No activity recorded yet.</p>;
  }
  const sorted = [...activities].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <ol className="space-y-3">
      {sorted.map((item) =>
        <li key={item.id} className="flex gap-3 text-sm">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
          <div className="min-w-0">
            <p className="text-ink">{item.description}</p>
            <p className="text-[13px] text-muted">{formatActivityTime(item.createdAt)}</p>
          </div>
        </li>
      )}
    </ol>
  );
}
