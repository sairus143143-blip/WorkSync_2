import React from 'react';
import { CircleCheckIcon, CircleSlashIcon, EyeIcon, PencilIcon } from 'lucide-react';
import type { Department, DepartmentSortKey, SortState } from '../../types/organization';
import { cn } from '../../utils/cn';
import { RecordStatusBadge } from '../organization/RecordStatusBadge';
import { IconButton } from '../ui/IconButton';
import { Table, type TableColumn } from '../ui/Table';

export interface DepartmentRow {
  department: Department;
  employees: number;
  positions: number;
}

interface DepartmentTableProps {
  rows: DepartmentRow[];
  sort: SortState<DepartmentSortKey>;
  onSort: (key: string) => void;
  onView: (row: DepartmentRow) => void;
  onEdit: (row: DepartmentRow) => void;
  onToggleStatus: (row: DepartmentRow) => void;
}

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

export function DepartmentTable({ rows, sort, onSort, onView, onEdit, onToggleStatus }: DepartmentTableProps) {
  const columns: TableColumn<DepartmentRow>[] = [
  {
    key: 'department',
    header: 'Department',
    sortKey: 'name',
    render: ({ department: d }) =>
    <div className={cn('min-w-[180px]', d.status === 'inactive' && 'opacity-60')}>
          <p className="font-medium text-ink">{d.name}</p>
          <p className="text-[13px] text-muted sm:hidden">{d.code}</p>
        </div>

  },
  {
    key: 'code',
    header: 'Department Code',
    sortKey: 'code',
    hideBelow: 'sm',
    render: ({ department: d }) => <span className="font-medium tabular-nums">{d.code}</span>
  },
  {
    key: 'description',
    header: 'Description',
    hideBelow: 'lg',
    render: ({ department: d }) => <p className="max-w-xs truncate text-muted" title={d.description}>{d.description}</p>
  },
  {
    key: 'employees',
    header: 'Employees',
    sortKey: 'employees',
    render: (r) => <span className="whitespace-nowrap tabular-nums">{plural(r.employees, 'employee')}</span>
  },
  {
    key: 'positions',
    header: 'Positions',
    sortKey: 'positions',
    hideBelow: 'md',
    render: (r) => <span className="whitespace-nowrap tabular-nums text-muted">{plural(r.positions, 'position')}</span>
  },
  { key: 'status', header: 'Status', sortKey: 'status', render: ({ department: d }) => <RecordStatusBadge status={d.status} /> },
  {
    key: 'actions',
    header: 'Actions',
    align: 'right',
    render: (r) => {
      const { name, status } = r.department;
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


  return <Table caption="Departments" columns={columns} rows={rows} getRowKey={(r) => r.department.id} sort={sort} onSort={onSort} />;
}