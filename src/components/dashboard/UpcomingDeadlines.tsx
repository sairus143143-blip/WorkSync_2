import React from 'react';
import { upcomingDeadlines } from '../../data/dashboard';
import type { DeadlineItem, Priority, WorkStatus } from '../../types/dashboard';
import type { BadgeTone } from '../../types/ui';
import { cn } from '../../utils/cn';
import { PersonCell } from '../people/PersonCell';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Table, type TableColumn } from '../ui/Table';

const priorityTone: Record<Priority, BadgeTone> = { Low: 'neutral', Medium: 'info', High: 'warning', Urgent: 'danger' };
const statusTone: Record<WorkStatus, BadgeTone> = {
  'To do': 'neutral',
  'In progress': 'info',
  'In review': 'primary',
  Blocked: 'danger'
};

const columns: TableColumn<DeadlineItem>[] = [
{
  key: 'name',
  header: 'Task / project',
  render: (d) =>
  <div className="min-w-[180px]">
        <div className="flex items-center gap-2">
          <p className="font-medium">{d.name}</p>
          <Badge tone={d.kind === 'Project' ? 'primary' : 'neutral'}>{d.kind}</Badge>
        </div>
        <p className="text-[13px] text-muted">{d.project ?? 'Project deadline'}</p>
      </div>

},
{ key: 'assignee', header: 'Assigned to', hideBelow: 'md', render: (d) => <PersonCell name={d.assignee} /> },
{
  key: 'due',
  header: 'Due date',
  render: (d) =>
  <div className="whitespace-nowrap">
        <p className="tabular-nums">{d.due}</p>
        <p className={cn('text-xs', d.dueIn === 'Tomorrow' ? 'font-medium text-danger' : 'text-subtle')}>{d.dueIn}</p>
      </div>

},
{ key: 'priority', header: 'Priority', hideBelow: 'sm', render: (d) => <Badge tone={priorityTone[d.priority]}>{d.priority}</Badge> },
{ key: 'status', header: 'Status', align: 'right', render: (d) => <Badge tone={statusTone[d.status]} dot>{d.status}</Badge> }];


export function UpcomingDeadlines({ className }: {className?: string;}) {
  return (
    <Card title="Upcoming deadlines" description="Tasks and projects due in the next two weeks" className={className} bodyClassName="p-0 pt-4">
      <Table caption="Upcoming deadlines" columns={columns} rows={upcomingDeadlines} getRowKey={(d) => d.id} />
    </Card>);

}