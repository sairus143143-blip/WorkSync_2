import React from 'react';
import { CircleCheckIcon, CircleSlashIcon, EyeIcon, PencilIcon, ShieldPlusIcon, TriangleAlertIcon } from 'lucide-react';
import type { AssignmentRow, AssignmentSortKey } from '../../types/assignments';
import type { SortState } from '../../types/organization';
import { cn } from '../../utils/cn';
import { formatUpdatedDate } from '../../utils/assignments';
import { Badge } from '../ui/Badge';
import { IconButton } from '../ui/IconButton';
import { Table, type TableColumn } from '../ui/Table';
import { AssignmentStatusBadge } from './AssignmentStatusBadge';

interface AssignmentTableProps {
  rows: AssignmentRow[];
  sort: SortState<AssignmentSortKey>;
  onSort: (key: string) => void;
  onView: (row: AssignmentRow) => void;
  onAssign: (row: AssignmentRow) => void;
  onDeactivate: (row: AssignmentRow) => void;
  onActivate: (row: AssignmentRow) => void;
}

export function AssignmentTable({ rows, sort, onSort, onView, onAssign, onDeactivate, onActivate }: AssignmentTableProps) {
  const columns: TableColumn<AssignmentRow>[] = [
  {
    key: 'position',
    header: 'Position',
    sortKey: 'name',
    render: ({ position: p, department }) =>
    <div className="min-w-[180px]">
          <p className={cn('font-medium text-ink', p.status === 'inactive' && 'text-muted')}>{p.name}</p>
          <p className="text-[13px] text-muted md:hidden">
            <span className="tabular-nums sm:hidden">{p.code} · </span>
            {department?.name ?? 'Unknown department'}
          </p>
          {p.status === 'inactive' && <Badge className="mt-1">Position inactive · Historical</Badge>}
        </div>

  },
  {
    key: 'code',
    header: 'Position Code',
    sortKey: 'code',
    hideBelow: 'sm',
    render: ({ position: p }) => <span className="whitespace-nowrap font-medium tabular-nums">{p.code}</span>
  },
  {
    key: 'department',
    header: 'Department',
    sortKey: 'department',
    hideBelow: 'md',
    render: ({ department }) =>
    department ?
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
            {department.name}
            {department.status === 'inactive' && <Badge>Inactive</Badge>}
          </span> :

    <span className="text-danger">Unknown department</span>

  },
  {
    key: 'area',
    header: 'Responsible Administrative Area',
    sortKey: 'area',
    render: ({ adminArea, assignment, departmentMismatch }) =>
    adminArea ?
    <div className="whitespace-nowrap">
            <span className={cn(assignment?.status === 'inactive' && 'text-muted')}>{adminArea.name}</span>
            {departmentMismatch &&
      <p className="mt-0.5 flex items-center gap-1 text-xs text-warning">
                <TriangleAlertIcon className="h-3 w-3" aria-hidden />
                Position moved — review
              </p>
      }
          </div> :

    <span className="text-subtle">Not defined</span>

  },
  { key: 'status', header: 'Assignment Status', sortKey: 'status', render: (r) => <AssignmentStatusBadge status={r.status} /> },
  {
    key: 'updated',
    header: 'Last Updated',
    sortKey: 'updated',
    hideBelow: 'lg',
    render: ({ assignment }) =>
    <span className="whitespace-nowrap tabular-nums text-muted">{assignment ? formatUpdatedDate(assignment.updatedAt) : '—'}</span>

  },
  {
    key: 'actions',
    header: 'Actions',
    align: 'right',
    render: (r) => {
      const name = r.position.name;
      return (
        <div className="flex items-center justify-end gap-0.5">
            <IconButton label={`View ${name}`} onClick={() => onView(r)}>
              <EyeIcon className="h-4 w-4" />
            </IconButton>
            {r.status === 'unassigned' &&
          <IconButton label={`Assign responsibility for ${name}`} onClick={() => onAssign(r)}>
                <ShieldPlusIcon className="h-4 w-4 text-primary" />
              </IconButton>
          }
            {r.status === 'assigned' &&
          <>
                <IconButton label={`Edit assignment for ${name}`} onClick={() => onAssign(r)}>
                  <PencilIcon className="h-4 w-4" />
                </IconButton>
                <IconButton label={`Deactivate responsibility for ${name}`} onClick={() => onDeactivate(r)}>
                  <CircleSlashIcon className="h-4 w-4 text-danger" />
                </IconButton>
              </>
          }
            {r.status === 'inactive' &&
          <IconButton label={`Activate responsibility for ${name}`} onClick={() => onActivate(r)}>
                <CircleCheckIcon className="h-4 w-4 text-success" />
              </IconButton>
          }
          </div>);

    }
  }];


  return <Table caption="Position responsibilities" columns={columns} rows={rows} getRowKey={(r) => r.position.id} sort={sort} onSort={onSort} />;
}