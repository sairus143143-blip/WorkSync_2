import React from 'react';
import { EyeIcon, FlagIcon, PencilIcon, UsersRoundIcon } from 'lucide-react';
import type { ProjectRow, ProjectSortKey } from '../../types/projects';
import type { SortState } from '../../types/organization';
import { cn } from '../../utils/cn';
import { formatProjectDate } from '../../utils/projects';
import { IconButton } from '../ui/IconButton';
import { ProgressBar } from '../ui/ProgressBar';
import { Table, type TableColumn } from '../ui/Table';
import { DeadlineBadge, ProjectStatusBadge, projectStatusMeta } from './ProjectBadges';

interface ProjectTableProps {
  rows: ProjectRow[];
  /** Resolved name of the controlling admin (from createdBy). */
  leadName: (createdBy: string) => string;
  sort: SortState<ProjectSortKey>;
  onSort: (key: string) => void;
  onView: (row: ProjectRow) => void;
  onEdit: (row: ProjectRow) => void;
  onManageMembers: (row: ProjectRow) => void;
  onChangeStatus: (row: ProjectRow) => void;
}

export function ProjectTable({ rows, leadName, sort, onSort, onView, onEdit, onManageMembers, onChangeStatus }: ProjectTableProps) {
  const columns: TableColumn<ProjectRow>[] = [
  {
    key: 'project',
    header: 'Project',
    sortKey: 'name',
    render: (r) =>
    <button
      type="button"
      onClick={() => onView(r)}
      className="block min-w-[200px] max-w-[280px] rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
      
          <span className="block truncate font-medium text-ink hover:text-primary">{r.project.name}</span>
          <span className="block truncate text-[13px] text-muted">{r.project.description || 'No description'}</span>
        </button>

  },
  { key: 'code', header: 'Project Code', sortKey: 'code', hideBelow: 'md', render: (r) => <span className="whitespace-nowrap tabular-nums text-muted">{r.project.code}</span> },
  { key: 'lead', header: 'Project Lead', hideBelow: 'lg', render: (r) => <span className="whitespace-nowrap text-muted">{leadName(r.project.createdBy)}</span> },
  {
    key: 'members',
    header: 'Members',
    sortKey: 'members',
    hideBelow: 'md',
    render: (r) =>
    <span className={cn('whitespace-nowrap tabular-nums', r.memberCount === 0 && 'text-subtle')}>
          {r.memberCount === 0 ? 'No members' : `${r.memberCount} ${r.memberCount === 1 ? 'employee' : 'employees'}`}
        </span>

  },
  {
    key: 'start',
    header: 'Start Date',
    sortKey: 'startDate',
    hideBelow: 'lg',
    render: (r) => <span className="whitespace-nowrap tabular-nums text-muted">{formatProjectDate(r.project.startDate, 'MMM d, yyyy')}</span>
  },
  {
    key: 'deadline',
    header: 'Deadline',
    sortKey: 'deadline',
    render: (r) =>
    <div className="space-y-1 whitespace-nowrap">
          <p className="tabular-nums">{formatProjectDate(r.project.deadline, 'MMM d, yyyy')}</p>
          <DeadlineBadge state={r.deadlineState} />
        </div>

  },
  {
    key: 'progress',
    header: 'Progress',
    sortKey: 'progress',
    hideBelow: 'sm',
    render: (r) =>
    <div className="flex w-28 items-center gap-2">
          <ProgressBar value={r.project.progress} tone={projectStatusMeta[r.project.status].bar} label={`${r.project.name} progress`} />
          <span className="w-9 shrink-0 text-right text-[13px] font-medium tabular-nums">{r.project.progress}%</span>
        </div>

  },
  { key: 'status', header: 'Status', sortKey: 'status', render: (r) => <ProjectStatusBadge status={r.project.status} /> },
  {
    key: 'actions',
    header: 'Actions',
    align: 'right',
    render: (r) =>
    <div className="flex items-center justify-end gap-0.5">
          <IconButton label={`View ${r.project.name}`} onClick={() => onView(r)}>
            <EyeIcon className="h-4 w-4" />
          </IconButton>
          <IconButton label={`Edit ${r.project.name}`} onClick={() => onEdit(r)}>
            <PencilIcon className="h-4 w-4" />
          </IconButton>
          <IconButton label={`Manage members of ${r.project.name}`} onClick={() => onManageMembers(r)}>
            <UsersRoundIcon className="h-4 w-4" />
          </IconButton>
          <IconButton label={`Change status of ${r.project.name}`} onClick={() => onChangeStatus(r)}>
            <FlagIcon className="h-4 w-4" />
          </IconButton>
        </div>

  }];


  return <Table caption="Projects" columns={columns} rows={rows} getRowKey={(r) => r.project.id} sort={sort} onSort={onSort} />;
}