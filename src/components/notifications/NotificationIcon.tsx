import React from 'react';
import { BellIcon, ClockIcon, FolderKanbanIcon, ListChecksIcon } from 'lucide-react';
import type { NotificationType } from '../../types/notifications';
import { cn } from '../../utils/cn';

const icons = {
  attendance: ClockIcon,
  task: ListChecksIcon,
  project: FolderKanbanIcon,
  system: BellIcon
};

const tones: Record<NotificationType, string> = {
  attendance: 'bg-warning/10 text-warning',
  task: 'bg-info/10 text-info',
  project: 'bg-primary-soft text-primary',
  system: 'bg-ink/[0.06] text-muted'
};

export function NotificationIcon({ type }: {type: NotificationType;}) {
  const Icon = icons[type];
  return (
    <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', tones[type])} aria-hidden>
      <Icon className="h-4 w-4" />
    </span>);

}