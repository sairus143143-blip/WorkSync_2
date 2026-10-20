import React, { useCallback, useState } from 'react';
import { CalendarOffIcon, SearchXIcon } from 'lucide-react';
import type { AttendanceRow, AttendanceStatusFilter, DailySortKey } from '../../types/attendance';
import type { Department, Position } from '../../types/organization';
import { useTableDirectory } from '../../hooks/useTableDirectory';
import { ATTENDANCE_STATUSES, ATTENDANCE_STATUS_LABELS, formatAttendanceDate, isWorkingDay } from '../../utils/attendance';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { SearchInput } from '../ui/SearchInput';
import { Select } from '../ui/Select';
import { AttendanceDateControl } from './AttendanceDateControl';
import { AttendanceStatusBreakdown } from './AttendanceStatusBreakdown';
import { AttendanceTable } from './AttendanceTable';

interface DailyAttendancePanelProps {
  rows: AttendanceRow[];
  date: string;
  today: string;
  departments: Department[];
  positions: Position[];
  onDateChange: (date: string) => void;
  onView: (row: AttendanceRow) => void;
  onEdit: (row: AttendanceRow) => void;
}

const statusOrder = Object.fromEntries(ATTENDANCE_STATUSES.map((s, i) => [s, i]));

function compareRows(a: AttendanceRow, b: AttendanceRow, key: DailySortKey) {
  switch (key) {
    case 'employee':
      return a.fullName.localeCompare(b.fullName);
    case 'checkIn':
      // Rows without a check-in sort last when ascending.
      return (a.checkIn ?? '99:99').localeCompare(b.checkIn ?? '99:99');
    case 'hours':
      return a.workedMinutes - b.workedMinutes;
    case 'status':
      return statusOrder[a.status] - statusOrder[b.status];
  }
}

const searchText = (r: AttendanceRow) => `${r.fullName} ${r.employee.employeeNumber}`;

export function DailyAttendancePanel({ rows, date, today, departments, positions, onDateChange, onView, onEdit }: DailyAttendancePanelProps) {
  const [status, setStatus] = useState<AttendanceStatusFilter>('all');
  const [departmentId, setDepartmentIdState] = useState('all');
  const [positionId, setPositionId] = useState('all');

  const setDepartmentId = (next: string) => {
    setDepartmentIdState(next);
    if (next !== 'all' && positionId !== 'all' && positions.find((p) => p.id === positionId)?.departmentId !== next) setPositionId('all');
  };

  const matches = useCallback(
    (r: AttendanceRow) =>
    (status === 'all' || r.status === status) && (
    departmentId === 'all' || r.employee.departmentId === departmentId) && (
    positionId === 'all' || r.employee.positionId === positionId),
    [status, departmentId, positionId]
  );
  const directory = useTableDirectory<AttendanceRow, DailySortKey>({
    rows,
    searchText,
    matches,
    compare: compareRows,
    initialSort: { key: 'checkIn', direction: 'asc' },
    descFirst: ['hours']
  });

  const hasFilters = directory.query.trim() !== '' || status !== 'all' || departmentId !== 'all' || positionId !== 'all';
  const clearFilters = () => {
    directory.setQuery('');
    setStatus('all');
    setDepartmentIdState('all');
    setPositionId('all');
  };

  const positionOptions = departmentId === 'all' ? positions : positions.filter((p) => p.departmentId === departmentId);
  const nonWorkingDay = rows.length === 0 && !isWorkingDay(date);

  return (
    <div className="space-y-6">
      <Card bodyClassName="p-0">
        <div className="space-y-3 border-b border-line p-4">
          <AttendanceDateControl value={date} today={today} onChange={onDateChange} />
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <SearchInput
              value={directory.query}
              onChange={directory.setQuery}
              label="Search employee"
              placeholder="Search employee..."
              className="xl:max-w-xs" />
            
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:flex xl:items-center">
              <Select
                hideLabel
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as AttendanceStatusFilter)}
                className="xl:w-40"
                options={[{ value: 'all', label: 'All Status' }, ...ATTENDANCE_STATUSES.map((s) => ({ value: s, label: ATTENDANCE_STATUS_LABELS[s] }))]} />
              
              <Select
                hideLabel
                label="Department"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="xl:w-52"
                options={[{ value: 'all', label: 'All Departments' }, ...departments.map((d) => ({ value: d.id, label: d.name }))]} />
              
              <Select
                hideLabel
                label="Position"
                value={positionId}
                onChange={(e) => setPositionId(e.target.value)}
                className="xl:w-52"
                options={[{ value: 'all', label: 'All Positions' }, ...positionOptions.map((p) => ({ value: p.id, label: p.name }))]} />
              
            </div>
            <div className="flex items-center gap-3 xl:ml-auto">
              <p className="whitespace-nowrap text-[13px] text-muted" aria-live="polite">
                {directory.visible.length} {directory.visible.length === 1 ? 'record' : 'records'}
              </p>
              <Button variant="ghost" size="sm" onClick={clearFilters} disabled={!hasFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {nonWorkingDay ?
        <EmptyState
          icon={CalendarOffIcon}
          title="No attendance for this day"
          description={`${formatAttendanceDate(date, 'EEEE, MMMM d')} is a non-working day, and no attendance was recorded.`}
          action={
          <Button variant="secondary" onClick={() => onDateChange(today)}>
                Go to today
              </Button>
          } /> :

        directory.visible.length === 0 ?
        <EmptyState
          icon={SearchXIcon}
          title="No attendance records found."
          description={hasFilters ? 'Try adjusting your search or filters.' : 'There are no attendance records for this date.'}
          action={
          hasFilters ?
          <Button variant="secondary" onClick={clearFilters}>
                  Clear Filters
                </Button> :
          undefined
          } /> :


        <AttendanceTable rows={directory.visible} sort={directory.sort} onSort={directory.toggleSort} onView={onView} onEdit={onEdit} />
        }
      </Card>

      {!nonWorkingDay && rows.length > 0 && <AttendanceStatusBreakdown rows={rows} dateLabel={formatAttendanceDate(date)} />}
    </div>);

}