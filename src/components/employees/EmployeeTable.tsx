import React from 'react';
import { CalendarOffIcon, EyeIcon, PencilIcon, RotateCcwIcon, UserCheckIcon, UserXIcon } from 'lucide-react';
import type { EmployeeSort, EmployeeView, EmploymentStatus } from '../../types/employees';
import { cn } from '../../utils/cn';
import { formatDateHired } from '../../utils/employees';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Table, type TableColumn } from '../ui/Table';
import { EmploymentStatusBadge } from './EmploymentStatusBadge';

interface EmployeeTableProps {
  rows: EmployeeView[];
  sort: EmployeeSort;
  onSort: (key: string) => void;
  onView: (row: EmployeeView) => void;
  onEdit: (row: EmployeeView) => void;
  onChangeStatus: (row: EmployeeView, next: EmploymentStatus) => void;
}

function ActionButton({ label, onClick, children }: {label: string;onClick: () => void;children: React.ReactNode;}) {
  return (
    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={label} title={label} onClick={onClick}>
      {children}
    </Button>);

}

export function EmployeeTable({ rows, sort, onSort, onView, onEdit, onChangeStatus }: EmployeeTableProps) {
  const columns: TableColumn<EmployeeView>[] = [
  {
    key: 'employee',
    header: 'Employee',
    sortKey: 'name',
    render: (v) =>
    <div className={cn('flex min-w-[200px] items-center gap-3', v.employee.employmentStatus === 'inactive' && 'opacity-60')}>
          <Avatar name={v.fullName} src={v.employee.avatar ?? undefined} />
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{v.fullName}</p>
            <p className="truncate text-[13px] text-muted">
              <span className="font-medium tabular-nums text-ink/70 sm:hidden">{v.employee.employeeNumber} · </span>
              {v.user?.email ?? 'No linked account'}
            </p>
          </div>
        </div>

  },
  {
    key: 'number',
    header: 'Employee Number',
    sortKey: 'employeeNumber',
    hideBelow: 'sm',
    render: (v) => <span className="whitespace-nowrap font-medium tabular-nums">{v.employee.employeeNumber}</span>
  },
  { key: 'department', header: 'Department', sortKey: 'department', hideBelow: 'md', render: (v) => v.department?.name ?? '—' },
  {
    key: 'position',
    header: 'Position',
    sortKey: 'position',
    hideBelow: 'lg',
    render: (v) => <span className="text-muted">{v.position?.name ?? '—'}</span>
  },
  {
    key: 'status',
    header: 'Employment Status',
    sortKey: 'status',
    render: (v) => <EmploymentStatusBadge status={v.employee.employmentStatus} />
  },
  {
    key: 'hired',
    header: 'Date Hired',
    sortKey: 'dateHired',
    hideBelow: 'lg',
    render: (v) => <span className="whitespace-nowrap text-muted">{formatDateHired(v.employee.dateHired)}</span>
  },
  {
    key: 'actions',
    header: 'Actions',
    align: 'right',
    render: (v) => {
      const status = v.employee.employmentStatus;
      return (
        <div className="flex items-center justify-end gap-0.5">
            <ActionButton label={`View ${v.fullName}`} onClick={() => onView(v)}>
              <EyeIcon className="h-4 w-4" />
            </ActionButton>
            <ActionButton label={`Edit ${v.fullName}`} onClick={() => onEdit(v)}>
              <PencilIcon className="h-4 w-4" />
            </ActionButton>
            {status === 'active' &&
          <ActionButton label={`Set ${v.fullName} on leave`} onClick={() => onChangeStatus(v, 'on_leave')}>
                <CalendarOffIcon className="h-4 w-4 text-warning" />
              </ActionButton>
          }
            {status === 'on_leave' &&
          <ActionButton label={`Return ${v.fullName} to active`} onClick={() => onChangeStatus(v, 'active')}>
                <RotateCcwIcon className="h-4 w-4 text-success" />
              </ActionButton>
          }
            {status !== 'inactive' ?
          <ActionButton label={`Deactivate ${v.fullName}`} onClick={() => onChangeStatus(v, 'inactive')}>
                <UserXIcon className="h-4 w-4 text-danger" />
              </ActionButton> :

          <ActionButton label={`Activate ${v.fullName}`} onClick={() => onChangeStatus(v, 'active')}>
                <UserCheckIcon className="h-4 w-4 text-success" />
              </ActionButton>
          }
          </div>);

    }
  }];


  return (
    <Table
      caption="Employees"
      columns={columns}
      rows={rows}
      getRowKey={(v) => v.employee.id}
      sort={sort}
      onSort={onSort} />);


}