import { useMemo, useState } from 'react';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import { attendanceByPeriod, attendancePeriodOptions } from '../../data/dashboard';
import type { AttendancePeriod } from '../../types/dashboard';
import { chartColors } from '../../utils/chartColors';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { useAttendance } from '../../contexts/AttendanceContext';
import { useEmployees } from '../../contexts/EmployeesContext';
import { buildDailyRows, summarizeAttendance } from '../../utils/attendance';
import { useOrganization } from '../../contexts/OrganizationContext';

export function AttendanceOverview({ className }: {className?: string;}) {
  const [period, setPeriod] = useState<AttendancePeriod>('today');
  const { records, schedule } = useAttendance();
  const { employees } = useEmployees();
  const { positions } = useOrganization();
  const snapshot = attendanceByPeriod[period];
  const daily = useMemo(() => summarizeAttendance(buildDailyRows(schedule.today, { employees, records, positions, schedule })), [schedule, employees, records, positions]);
  const currentSnapshot = period === 'today' ? { ...snapshot, caption: `${daily.total} employees expected today`, present: daily.counts.present, late: daily.counts.late, absent: daily.counts.absent, leave: daily.counts.on_leave } : snapshot;
  const total = currentSnapshot.present + currentSnapshot.late + currentSnapshot.absent + currentSnapshot.leave;
  const attended = currentSnapshot.present + currentSnapshot.late;
  const rate = Math.round(attended / total * 100);

  const segments = [
  { id: 'present', label: 'Present', value: currentSnapshot.present, color: chartColors.primary, note: 'On time' },
  { id: 'late', label: 'Late', value: currentSnapshot.late, color: chartColors.warning, note: 'After 08:00' },
  { id: 'absent', label: 'Absent', value: currentSnapshot.absent, color: chartColors.danger, note: 'No check-in' },
  { id: 'leave', label: 'On Leave', value: currentSnapshot.leave, color: chartColors.neutral, note: 'Approved leave' }];


  return (
    <Card
      title="Attendance overview"
      description={currentSnapshot.caption}
      className={className}
      action={
      <Select
        hideLabel
        label="Attendance period"
        value={period}
        onChange={(e) => setPeriod(e.target.value as AttendancePeriod)}
        options={attendancePeriodOptions}
        className="w-36" />

      }>
      
      <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center">
        <figure className="relative h-[184px] w-[184px] shrink-0">
          <PieChart width={184} height={184}>
            <Pie
              data={segments}
              dataKey="value"
              nameKey="label"
              innerRadius={64}
              outerRadius={88}
              paddingAngle={2}
              startAngle={90}
              endAngle={-270}
              stroke="none"
              animationDuration={300}>
              
              {segments.map((s) =>
              <Cell key={s.id} fill={s.color} />
              )}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value} employees`, name]}
              contentStyle={{ borderRadius: 8, borderColor: chartColors.line, fontSize: 12 }} />
            
          </PieChart>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-semibold tracking-tight tabular-nums text-ink">{rate}%</span>
            <span className="text-xs text-muted">attended</span>
          </div>
          <figcaption className="sr-only">
            {segments.map((s) => `${s.label}: ${s.value}`).join(', ')}
          </figcaption>
        </figure>

        <div className="w-full flex-1">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
            {segments.map((s) =>
            <div key={s.id} className="border-l-2 pl-3" style={{ borderColor: s.color }}>
                <dt className="text-[13px] text-muted">{s.label}</dt>
                <dd className="mt-0.5 flex items-baseline gap-1.5">
                  <span className="text-xl font-semibold tabular-nums text-ink">{s.value}</span>
                  <span className="text-xs text-subtle">{Math.round(s.value / total * 100)}%</span>
                </dd>
                <dd className="text-xs text-subtle">{s.note}</dd>
              </div>
            )}
          </dl>
          <p className="mt-5 border-t border-line pt-3 text-[13px] text-muted">
            <span className="font-medium text-ink">{attended}</span> of {total} attended ·{' '}
            <span className={snapshot.comparison.startsWith('−') ? 'font-medium text-danger' : 'font-medium text-success'}>
              {currentSnapshot.comparison}
            </span>
          </p>
        </div>
      </div>
    </Card>);

}
