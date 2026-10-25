import React, { useCallback, useMemo, useState } from 'react';
import { addDays, format, parseISO } from 'date-fns';
import { EyeIcon, HistoryIcon } from 'lucide-react';
import type { AttendanceRecord, AttendanceRow, AttendanceStatusFilter, HistorySortKey, WorkSchedule } from '../../types/attendance';
import type { Employee } from '../../types/employees';
import type { Position } from '../../types/organization';
import { useTableDirectory } from '../../hooks/useTableDirectory';
import {
  ATTENDANCE_STATUSES,
  ATTENDANCE_STATUS_LABELS,
  buildRangeRows,
  formatAttendanceDate,
  formatDuration,
  formatTime } from
'../../utils/attendance';
import { employeeFullName } from '../../utils/employees';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { IconButton } from '../ui/IconButton';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Table, type TableColumn } from '../ui/Table';
import { AttendanceStatusBadge } from './AttendanceStatusBadge';

interface AttendanceHistoryPanelProps {
  employees: Employee[];
  records: AttendanceRecord[];
  positions: Position[];
  schedule: WorkSchedule;
  onView: (row: AttendanceRow) => void;
}

const PAGE_SIZE = 25;
const statusOrder = Object.fromEntries(ATTENDANCE_STATUSES.map((s, i) => [s, i]));

function compareRows(a: AttendanceRow, b: AttendanceRow, key: HistorySortKey) {
  switch (key) {
    case 'date':
      return a.date.localeCompare(b.date) || a.fullName.localeCompare(b.fullName);
    case 'employee':
      return a.fullName.localeCompare(b.fullName) || b.date.localeCompare(a.date);
    case 'status':
      return statusOrder[a.status] - statusOrder[b.status];
    case 'hours':
      return a.workedMinutes - b.workedMinutes;
  }
}

const searchText = (r: AttendanceRow) => `${r.fullName} ${r.employee.employeeNumber}`;

export function AttendanceHistoryPanel({ employees, records, positions, schedule, onView }: AttendanceHistoryPanelProps) {
  const defaultFrom = format(addDays(parseISO(schedule.today), -13), 'yyyy-MM-dd');
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(schedule.today);
  const [employeeId, setEmployeeId] = useState('all');
  const [status, setStatus] = useState<AttendanceStatusFilter>('all');
  const [limit, setLimit] = useState(PAGE_SIZE);

  const rows = useMemo(
    () => buildRangeRows(from, to, { employees, records, positions, schedule }),
    [from, to, employees, records, positions, schedule]
  );

  const matches = useCallback(
    (r: AttendanceRow) =>
    (employeeId === 'all' || r.employee.id === employeeId) && (
    status === 'all' || r.status === status),
    [employeeId, status]
  );
  const directory = useTableDirectory<AttendanceRow, HistorySortKey>({
    rows,
    searchText,
    matches,
    compare: compareRows,
    initialSort: { key: 'date', direction: 'desc' },
    descFirst: ['date', 'hours']
  });

  const hasFilters = from !== defaultFrom || to !== schedule.today || employeeId !== 'all' || status !== 'all';
  const clearFilters = () => {
    setFrom(defaultFrom);
    setTo(schedule.today);
    setEmployeeId('all');
    setStatus('all');
    setLimit(PAGE_SIZE);
  };
  const rangeError = from && to && from > to ? 'Start date must be before end date.' : undefined;
  const shown = directory.visible.slice(0, limit);

  const employeeOptions = employees.
  map((e) => ({ value: e.id, label: employeeFullName(e) })).
  sort((a, b) => a.label.localeCompare(b.label));

  const columns: TableColumn<AttendanceRow>[] = [
  {
    key: 'date',
    header: 'Date',
    sortKey: 'date',
    render: (r) => <span className="whitespace-nowrap tabular-nums">{formatAttendanceDate(r.date, 'EEE, MMM d')}</span>
  },
  {
    key: 'employee',
    header: 'Employee',
    sortKey: 'employee',
    render: (r) =>
    <div className="min-w-[150px]">
          <p className="truncate font-medium text-ink">{r.fullName}</p>
          <p className="text-[13px] tabular-nums text-muted">{r.employee.employeeNumber}</p>
        </div>

  },
  { key: 'status', header: 'Status', sortKey: 'status', render: (r) => <AttendanceStatusBadge status={r.status} /> },
  { key: 'checkIn', header: 'Check In', hideBelow: 'md', render: (r) => <span className="whitespace-nowrap tabular-nums">{formatTime(r.checkIn)}</span> },
  {
    key: 'checkOut',
    header: 'Check Out',
    hideBelow: 'md',
    render: (r) => <span className="whitespace-nowrap tabular-nums">{r.checkIn && !r.checkOut ? 'Not recorded' : formatTime(r.checkOut)}</span>
  },
  {
    key: 'hours',
    header: 'Working Hours',
    sortKey: 'hours',
    hideBelow: 'sm',
    render: (r) => <span className="whitespace-nowrap tabular-nums">{r.status === 'incomplete' ? '—' : formatDuration(r.workedMinutes)}</span>
  },
  {
    key: 'overtime',
    header: 'Overtime',
    hideBelow: 'lg',
    render: (r) =>
    <span className={cn('whitespace-nowrap tabular-nums', r.overtimeMinutes > 0 ? 'font-medium' : 'text-subtle')}>{formatDuration(r.overtimeMinutes)}</span>

  },
  {
    key: 'actions',
    header: 'Actions',
    align: 'right',
    render: (r) =>
    <IconButton label={`View attendance details for ${r.fullName} on ${formatAttendanceDate(r.date)}`} onClick={() => onView(r)}>
          <EyeIcon className="h-4 w-4" />
        </IconButton>

  }];


  return (
    <Card bodyClassName="p-0">
      <div className="grid gap-3 border-b border-line p-4 sm:grid-cols-2 lg:grid-cols-3 xl:flex xl:items-end">
        <Input type="date" label="From" value={from} max={schedule.today} onChange={(e) => {setFrom(e.target.value);setLimit(PAGE_SIZE);}} error={rangeError} className="xl:w-40" />
        <Input type="date" label="To" value={to} max={schedule.today} onChange={(e) => {setTo(e.target.value);setLimit(PAGE_SIZE);}} className="xl:w-40" />
        <Select
          label="Employee"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className="xl:w-52"
          options={[{ value: 'all', label: 'All Employees' }, ...employeeOptions]} />
        
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as AttendanceStatusFilter)}
          className="xl:w-40"
          options={[{ value: 'all', label: 'All Status' }, ...ATTENDANCE_STATUSES.map((s) => ({ value: s, label: ATTENDANCE_STATUS_LABELS[s] }))]} />
        
        <div className="flex items-center gap-3 xl:ml-auto xl:pb-0.5">
          <p className="whitespace-nowrap text-[13px] text-muted" aria-live="polite">
            {directory.visible.length} {directory.visible.length === 1 ? 'record' : 'records'}
          </p>
          <Button variant="ghost" size="sm" onClick={clearFilters} disabled={!hasFilters}>
            Clear Filters
          </Button>
        </div>
      </div>

      {directory.visible.length === 0 ?
      <EmptyState
        icon={HistoryIcon}
        title="No attendance history found."
        description={rangeError ?? 'Try a different date range or adjust your filters.'}
        action={
        hasFilters ?
        <Button variant="secondary" onClick={clearFilters}>
                Clear Filters
              </Button> :
        undefined
        } /> :


      <>
          <Table caption="Attendance history" columns={columns} rows={shown} getRowKey={(r) => r.key} sort={directory.sort} onSort={directory.toggleSort} />
          <div className="flex flex-col items-center gap-2 border-t border-line px-5 py-3 sm:flex-row sm:justify-between">
            <p className="text-[13px] text-muted">
              Showing {shown.length} of {directory.visible.length}
            </p>
            {shown.length < directory.visible.length &&
          <Button variant="secondary" size="sm" onClick={() => setLimit((n) => n + PAGE_SIZE)}>
                Show more
              </Button>
          }
          </div>
        </>
      }
    </Card>);

}