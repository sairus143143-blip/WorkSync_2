import React from 'react';
import {
  BanIcon,
  CalendarClockIcon,
  CircleCheckIcon,
  CircleDashedIcon,
  CirclePauseIcon,
  EyeIcon,
  FlameIcon,
  SignalHighIcon,
  SignalLowIcon,
  SignalMediumIcon,
  TriangleAlertIcon
} from 'lucide-react';
import type { TaskPriority, TaskStatus } from '../../types/tasks';
import type { BadgeTone } from '../../types/ui';
import { taskPriorityLabels, taskStatusLabels } from '../../utils/tasks';
import { Badge } from '../ui/Badge';

export const taskStatusMeta: Record<TaskStatus, { tone: BadgeTone; icon: React.ComponentType<{ className?: string }> }> = {
  todo: { tone: 'neutral', icon: CircleDashedIcon },
  in_progress: { tone: 'primary', icon: CirclePauseIcon },
  in_review: { tone: 'info', icon: EyeIcon },
  completed: { tone: 'success', icon: CircleCheckIcon },
  blocked: { tone: 'danger', icon: BanIcon }
};

export const taskPriorityMeta: Record<TaskPriority, { tone: BadgeTone; icon: React.ComponentType<{ className?: string }> }> = {
  low: { tone: 'neutral', icon: SignalLowIcon },
  medium: { tone: 'info', icon: SignalMediumIcon },
  high: { tone: 'warning', icon: SignalHighIcon },
  critical: { tone: 'danger', icon: FlameIcon }
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const meta = taskStatusMeta[status];
  const Icon = meta.icon;
  return (
    <Badge tone={meta.tone}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {taskStatusLabels[status]}
    </Badge>
  );
}

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  const meta = taskPriorityMeta[priority];
  const Icon = meta.icon;
  return (
    <Badge tone={meta.tone}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {taskPriorityLabels[priority]}
    </Badge>
  );
}

export function TaskDeadlineIndicators({ overdue, dueToday, dueSoon }: { overdue: boolean; dueToday: boolean; dueSoon: boolean }) {
  if (!overdue && !dueToday && !dueSoon) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {overdue &&
        <Badge tone="danger">
          <TriangleAlertIcon className="h-3.5 w-3.5" aria-hidden />
          Overdue
        </Badge>
      }
      {dueToday &&
        <Badge tone="warning">
          <CalendarClockIcon className="h-3.5 w-3.5" aria-hidden />
          Due Today
        </Badge>
      }
      {!overdue && !dueToday && dueSoon &&
        <Badge tone="warning">
          <CalendarClockIcon className="h-3.5 w-3.5" aria-hidden />
          Due Soon
        </Badge>
      }
    </div>
  );
}
