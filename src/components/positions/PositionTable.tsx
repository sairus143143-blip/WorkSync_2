import React from 'react';
import { CircleCheckIcon, CircleSlashIcon, EyeIcon, PencilIcon } from 'lucide-react';
import type { Position, PositionSortKey, SortState } from '../../types/organization';
import { cn } from '../../utils/cn';
import { RecordStatusBadge } from '../organization/RecordStatusBadge';
import { IconButton } from '../ui/IconButton';
import { Table, type TableColumn } from '../ui/Table';

export interface PositionRow {
  position: Position;
  employees: number;
}

interface PositionTableProps {
  rows: PositionRow[];
  sort: SortState<PositionSortKey>;
  onSort: (key: string) => void;
  onView: (row: PositionRow) => void;
  onEdit: (row: PositionRow) => void;
  onToggleStatus: (row: PositionRow) => void;
}

export function PositionTable({ rows, sort, onSort, onView, onEdit, onToggleStatus }: PositionTableProps) {
  const columns: TableColumn<PositionRow>[] = [
  {
    key: 'position',
    header: 'Position',
    sortKey: 'name',
    render: ({ position: p }) =>
    <div className={cn('min-w-[180px]', p.status === 'inactive' && 'opacity-60')}>
          <p className="font-medium text-ink">{p.name}</p>
          <p className="text-[13px] text-muted md:hidden">
            <span className="tabular-nums sm:hidden">{p.code} · </span>
            {p.description}
          </p>
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
    key: 'employees',
    header: 'Employees',
    sortKey: 'employees',
    render: (r) =>
    <span className={cn('whitespace-nowrap tabular-nums', r.employees === 0 && 'text-subtle')}>
          {r.employees} {r.employees === 1 ? 'employee' : 'employees'}
        </span>

  },
  { key: 'status', header: 'Status', sortKey: 'status', render: ({ position: p }) => <RecordStatusBadge status={p.status} /> },
  {
    key: 'actions',
    header: 'Actions',
    align: 'right',
    render: (r) => {
      const { name, status } = r.position;
      return (
        <div className="flex items-center justify-end gap-0.5">
            <IconButton label={`View ${name}`} onClick={() => onView(r)}>
              <EyeIcon className="h-4 w-4" />
            </IconButton>
            <IconButton label={`Edit ${name}`} onClick={() => onEdit(r)}>
              <PencilIcon className="h-4 w-4" />
            </IconButton>
            {status === 'active' ?
          <IconButton label={`Deactivate ${name}`} onClick={() => onToggleStatus(r)}>
                <CircleSlashIcon className="h-4 w-4 text-danger" />
              </IconButton> :

          <IconButton label={`Activate ${name}`} onClick={() => onToggleStatus(r)}>
                <CircleCheckIcon className="h-4 w-4 text-success" />
              </IconButton>
          }
          </div>);

    }
  }];


  return <Table caption="Positions" columns={columns} rows={rows} getRowKey={(r) => r.position.id} sort={sort} onSort={onSort} />;
}