import React from 'react';
import { CircleXIcon, ClockIcon, PlaneIcon, TimerIcon, UserCheckIcon } from 'lucide-react';
import type { AttendanceRow } from '../../types/attendance';
import { formatDuration, summarizeAttendance } from '../../utils/attendance';
import { StatCard } from '../ui/StatCard';

interface AttendanceSummaryProps {
  rows: AttendanceRow[];
  /** "Today" when the selected date is today, otherwise the short date. */
  dayLabel: string;
}

function people(n: number) {
  return `${n} ${n === 1 ? 'employee' : 'employees'}`;
}

export function AttendanceSummary({ rows, dayLabel }: AttendanceSummaryProps) {
  const s = summarizeAttendance(rows);
  const suffix = dayLabel === 'Today' ? 'Today' : `· ${dayLabel}`;

  return (
    <section aria-label="Attendance summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <StatCard label={`Present ${suffix}`} value={String(s.checkedIn)} icon={UserCheckIcon} tone="primary" featured hint="Employees checked in" />
      <StatCard label={`Late ${suffix}`} value={String(s.counts.late)} icon={ClockIcon} tone={s.counts.late > 0 ? 'warning' : 'neutral'} hint={`${people(s.counts.late)} arrived late`} />
      <StatCard label={`Absent ${suffix}`} value={String(s.counts.absent)} icon={CircleXIcon} tone={s.counts.absent > 0 ? 'danger' : 'neutral'} hint="No attendance recorded" />
      <StatCard label="On Leave" value={String(s.counts.on_leave)} icon={PlaneIcon} tone="neutral" hint="Approved leave" />
      <StatCard label={`Total Hours ${suffix}`} value={formatDuration(s.workedMinutes)} icon={TimerIcon} tone="success" hint="Across completed attendance" />
    </section>);

}