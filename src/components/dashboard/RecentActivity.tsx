import React from 'react';
import { AlarmClockIcon, CircleCheckIcon, FolderPlusIcon, LogInIcon, UserPlusIcon } from 'lucide-react';
import { recentActivity } from '../../data/dashboard';
import type { ActivityType } from '../../types/dashboard';
import { cn } from '../../utils/cn';
import { Card } from '../ui/Card';

const typeIcon = {
  task: CircleCheckIcon,
  assignment: UserPlusIcon,
  attendance: LogInIcon,
  project: FolderPlusIcon,
  deadline: AlarmClockIcon
};

const typeTone: Record<ActivityType, string> = {
  task: 'bg-success/10 text-success',
  assignment: 'bg-info/10 text-info',
  attendance: 'bg-primary-soft text-primary',
  project: 'bg-ink/[0.06] text-muted',
  deadline: 'bg-warning/10 text-warning'
};

export function RecentActivity({ className }: {className?: string;}) {
  return (
    <Card title="Recent activity" description="Latest updates across WorkSync" className={className}>
      <ol className="relative space-y-5">
        {recentActivity.map((item) => {
          const Icon = typeIcon[item.type];
          return (
            <li key={item.id} className="flex gap-3">
              <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', typeTone[item.type])} aria-hidden>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[13px] leading-snug text-muted">
                  {item.actor && <span className="font-medium text-ink">{item.actor} </span>}
                  {item.action} <span className="font-medium text-ink">{item.target}</span>
                </p>
                <p className="mt-0.5 text-xs text-subtle">{item.time}</p>
              </div>
            </li>);

        })}
      </ol>
    </Card>);

}