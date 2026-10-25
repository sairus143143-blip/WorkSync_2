import React from 'react';
import { EyeIcon, PencilIcon } from 'lucide-react';
import type { AttendanceRow, DailySortKey } from '../../types/attendance';
import type { SortState } from '../../types/organization';
import { cn } from '../../utils/cn';
import { formatAttendanceDate, formatDuration, formatTime } from '../../utils/attendance';
import { Avatar } from '../ui/Avatar';
import { IconButton } from '../ui/IconButton';
import { Table, type TableColumn } from '../ui/Table';
import { AttendanceStatusBadge } from './AttendanceStatusBadge';

interface AttendanceTableProps {
  rows: AttendanceRow[];
  sort: SortState<DailySortKey>;
  onSort: (key: string) => void;
  onView: (row: AttendanceRow) => void;
  onEdit: (row: AttendanceRow) => void;
}

export function AttendanceTable({ rows, sort, onSort, onView, onEdit }: AttendanceTableProps) {
  const columns: TableColumn<AttendanceRow>[] = [
  {
    key: 'employee',
    header: 'Employee',
    sortKey: 'employee',
    render: (r) =>
    <div className="flex min-w-[190px] items-center gap-3">
          <Avatar name={r.fullName} src={r.employee.avatar ?? undefined} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{r.fullName}</p>
            <p className="truncate text-[13px] tabular-nums text-muted">{r.employee.employeeNumber}</p>
          </div>
        </div>

  },
  {
    key: 'number',
    header: 'Employee Number',
    hideBelow: 'lg',
    render: (r) => <span className="whitespace-nowrap tabular-nums text-muted">{r.employee.employeeNumber}</span>
  },
  {
    key: 'position',
    header: 'Position',
    hideBelow: 'lg',
    render: (r) => <span className="whitespace-nowrap text-muted">{r.position?.name ?? '—'}</span>
  },
  {
    key: 'date',
    header: 'Date',
    hideBelow: 'lg',
    render: (r) => <span className="whitespace-nowrap tabular-nums text-muted">{formatAttendanceDate(r.date, 'MMM d, yyyy')}</span>
  },
  {
    key: 'checkIn',
    header: 'Check In',
    sortKey: 'checkIn',
    render: (r) =>
    <div className="whitespace-nowrap">
          <span className="tabular-nums">{formatTime(r.checkIn)}</span>
          {r.lateMinutes > 0 && <p className="text-xs text-warning">Late by {r.lateMinutes} min</p>}
        </div>

  },
  {
    key: 'checkOut',
    header: 'Check Out',
    hideBelow: 'sm',
    render: (r) =>
    <span className={cn('whitespace-nowrap tabular-nums', !r.checkOut && r.checkIn && 'text-subtle')}>
          {r.checkIn && !r.checkOut ? 'Not recorded' : formatTime(r.checkOut)}
        </span>

  },
  {
    key: 'hours',
    header: 'Working Hours',
    sortKey: 'hours',
    hideBelow: 'sm',
    render: (r) =>
    <span className="whitespace-nowrap tabular-nums">{r.status === 'incomplete' ? <span className="text-subtle">—</span> : formatDuration(r.workedMinutes)}</span>

  },
  { key: 'status', header: 'Status', sortKey: 'status', render: (r) => <AttendanceStatusBadge status={r.status} /> },
  {
    key: 'overtime',
    header: 'Overtime',
    hideBelow: 'md',
    render: (r) =>
    <span className={cn('whitespace-nowrap tabular-nums', r.overtimeMinutes > 0 ? 'font-medium text-ink' : 'text-subtle')}>
          {formatDuration(r.overtimeMinutes)}
        </span>

  },
  {
    key: 'actions',
    header: 'Actions',
    align: 'right',
    render: (r) =>
    <div className="flex items-center justify-end gap-0.5">
          <IconButton label={`View attendance details for ${r.fullName}`} onClick={() => onView(r)}>
            <EyeIcon className="h-4 w-4" />
          </IconButton>
          <IconButton label={r.derived ? `Record attendance for ${r.fullName}` : `Edit attendance for ${r.fullName}`} onClick={() => onEdit(r)}>
            <PencilIcon className="h-4 w-4" />
          </IconButton>
        </div>

  }];


  return <Table caption="Attendance records" columns={columns} rows={rows} getRowKey={(r) => r.key} sort={sort} onSort={onSort} />;
}