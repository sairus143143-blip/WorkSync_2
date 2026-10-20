import React from 'react';
import type { AttendanceRow, AttendanceStatus } from '../../types/attendance';
import type { ProgressTone } from '../../types/ui';
import { ATTENDANCE_STATUSES, ATTENDANCE_STATUS_LABELS, summarizeAttendance } from '../../utils/attendance';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { attendanceStatusMeta } from './AttendanceStatusBadge';

const barTone: Record<AttendanceStatus, ProgressTone> = {
  present: 'success',
  late: 'warning',
  absent: 'danger',
  on_leave: 'primary',
  half_day: 'primary',
  incomplete: 'warning'
};

/** Compact count + share per status for the selected date. */
export function AttendanceStatusBreakdown({ rows, dateLabel }: {rows: AttendanceRow[];dateLabel: string;}) {
  const s = summarizeAttendance(rows);

  return (
    <Card title="Attendance status breakdown" description={`${s.total} ${s.total === 1 ? 'employee' : 'employees'} expected · ${dateLabel}`}>
      <ul className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {ATTENDANCE_STATUSES.map((status) => {
          const count = s.counts[status];
          const percent = s.total ? Math.round(count / s.total * 100) : 0;
          const Icon = attendanceStatusMeta[status].icon;
          return (
            <li key={status}>
              <div className="flex items-center gap-1.5 text-[13px] text-muted">
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {ATTENDANCE_STATUS_LABELS[status]}
              </div>
              <p className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xl font-semibold tabular-nums text-ink">{count}</span>
                <span className="text-[13px] tabular-nums text-muted">{percent}%</span>
              </p>
              <ProgressBar value={percent} tone={barTone[status]} className="mt-2" />
            </li>);

        })}
      </ul>
    </Card>);

}