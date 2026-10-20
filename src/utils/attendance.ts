import { eachDayOfInterval, format, isWeekend, parseISO } from 'date-fns';
import type {
  AttendanceFormErrors,
  AttendanceFormValues,
  AttendanceRecord,
  AttendanceRow,
  AttendanceStatus,
  WorkSchedule } from
'../types/attendance';
import type { Employee } from '../types/employees';
import type { Department, Position } from '../types/organization';
import { employeeFullName } from './employees';
import { findDepartment, findPosition } from './organization';
import { formatConfiguredDate, formatConfiguredTime } from './settingsFormat';

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'Present',
  late: 'Late',
  absent: 'Absent',
  on_leave: 'On Leave',
  half_day: 'Half Day',
  incomplete: 'Incomplete'
};

export const ATTENDANCE_STATUSES: AttendanceStatus[] = ['present', 'late', 'absent', 'on_leave', 'half_day', 'incomplete'];

/** Statuses that never carry check-in/out times. */
export const NO_TIME_STATUSES: AttendanceStatus[] = ['absent', 'on_leave'];

// ---------- Time helpers ----------

export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** "08:17" → "08:17 AM" */
export function formatTime(time: string | null): string {
  if (!time) return '—';
  return formatConfiguredTime(time);
}

/** 475 → "7h 55m", 0 → "0h" */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '0h';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

/** 17 → "17 minutes", 75 → "1h 15m" */
export function formatLate(minutes: number): string {
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  return formatDuration(minutes);
}

export function formatAttendanceDate(date: string, pattern = 'MMMM d, yyyy'): string {
  return pattern === 'MMMM d, yyyy' ? formatConfiguredDate(date) : format(parseISO(date), pattern);
}

// ---------- Calculations (display rules only, not a payroll engine) ----------

/** Time between check-in and check-out, minus any overlap with the lunch break. */
export function workedMinutes(checkIn: string | null, checkOut: string | null, s: WorkSchedule): number {
  if (!checkIn || !checkOut) return 0;
  const start = toMinutes(checkIn);
  const end = toMinutes(checkOut);
  if (end <= start) return 0;
  const lunchOverlap = Math.max(0, Math.min(end, toMinutes(s.lunchEnd)) - Math.max(start, toMinutes(s.lunchStart)));
  return end - start - lunchOverlap;
}

export function lateMinutes(checkIn: string | null, s: WorkSchedule): number {
  return checkIn ? Math.max(0, toMinutes(checkIn) - toMinutes(s.expectedStart)) : 0;
}

export function overtimeMinutes(checkOut: string | null, s: WorkSchedule): number {
  return checkOut ? Math.max(0, toMinutes(checkOut) - toMinutes(s.expectedEnd)) : 0;
}

/** Status implied by the times, used to pre-fill the form. The admin can override it. */
export function suggestStatus(checkIn: string, checkOut: string, s: WorkSchedule): AttendanceStatus | '' {
  if (!checkIn) return '';
  if (!checkOut) return 'incomplete';
  if (workedMinutes(checkIn, checkOut, s) < s.halfDayThresholdMinutes) return 'half_day';
  return lateMinutes(checkIn, s) > 0 ? 'late' : 'present';
}

export function isWorkingDay(date: string): boolean {
  return !isWeekend(parseISO(date));
}

/** Employees expected to have attendance on a date. */
export function isEligibleOn(employee: Employee, date: string): boolean {
  return employee.employmentStatus !== 'inactive' && employee.dateHired <= date;
}

// ---------- Row building ----------

interface RowContext {
  employees: Employee[];
  records: AttendanceRecord[];
  departments: Department[];
  positions: Position[];
  schedule: WorkSchedule;
}

function toRow(employee: Employee, date: string, record: AttendanceRecord | undefined, ctx: RowContext): AttendanceRow {
  const status: AttendanceStatus = record ? record.status : employee.employmentStatus === 'on_leave' ? 'on_leave' : 'absent';
  const checkIn = record?.checkIn ?? null;
  const checkOut = record?.checkOut ?? null;
  return {
    key: record?.id ?? `derived-${date}-${employee.id}`,
    date,
    employee,
    fullName: employeeFullName(employee),
    department: findDepartment(ctx.departments, employee.departmentId),
    position: findPosition(ctx.positions, employee.positionId),
    record,
    derived: !record,
    status,
    checkIn,
    checkOut,
    workedMinutes: workedMinutes(checkIn, checkOut, ctx.schedule),
    lateMinutes: lateMinutes(checkIn, ctx.schedule),
    overtimeMinutes: overtimeMinutes(checkOut, ctx.schedule),
    notes: record?.notes ?? (status === 'on_leave' ? 'Employee is on approved leave.' : 'No attendance recorded.')
  };
}

/**
 * Every stored record for the date, plus a derived row (absent / on leave) for each
 * eligible employee with no record on a past or current working day.
 */
export function buildDailyRows(date: string, ctx: RowContext): AttendanceRow[] {
  const rows: AttendanceRow[] = [];
  const recorded = new Set<string>();
  for (const record of ctx.records) {
    if (record.date !== date) continue;
    const employee = ctx.employees.find((e) => e.id === record.employeeId);
    if (!employee) continue;
    recorded.add(employee.id);
    rows.push(toRow(employee, date, record, ctx));
  }
  if (isWorkingDay(date) && date <= ctx.schedule.today) {
    for (const employee of ctx.employees) {
      if (!recorded.has(employee.id) && isEligibleOn(employee, date)) rows.push(toRow(employee, date, undefined, ctx));
    }
  }
  return rows;
}

export function buildRangeRows(from: string, to: string, ctx: RowContext): AttendanceRow[] {
  if (!from || !to || from > to) return [];
  return eachDayOfInterval({ start: parseISO(from), end: parseISO(to) }).flatMap((d) => buildDailyRows(format(d, 'yyyy-MM-dd'), ctx));
}

/** Single source for the summary cards and the status breakdown. */
export function summarizeAttendance(rows: AttendanceRow[]) {
  const counts = Object.fromEntries(ATTENDANCE_STATUSES.map((s) => [s, 0])) as Record<AttendanceStatus, number>;
  for (const row of rows) counts[row.status] += 1;
  return {
    total: rows.length,
    counts,
    checkedIn: rows.filter((r) => r.checkIn).length,
    workedMinutes: rows.reduce((sum, r) => sum + r.workedMinutes, 0),
    overtimeMinutes: rows.reduce((sum, r) => sum + r.overtimeMinutes, 0)
  };
}

// ---------- Validation ----------

interface ValidationContext {
  records: AttendanceRecord[];
  employees: Employee[];
  schedule: WorkSchedule;
  editingId?: string;
}

export function validateAttendance(v: AttendanceFormValues, ctx: ValidationContext): AttendanceFormErrors {
  const errors: AttendanceFormErrors = {};
  const employee = ctx.employees.find((e) => e.id === v.employeeId);

  if (!v.employeeId) errors.employeeId = 'Please select an employee.';else
  if (!employee) errors.employeeId = 'The selected employee no longer exists.';

  if (!v.date) errors.date = 'Date is required.';else
  if (v.date > ctx.schedule.today && v.status !== 'on_leave') errors.date = 'Attendance can’t be recorded for a future date.';else
  if (employee && v.date < employee.dateHired) errors.date = `This employee was hired on ${formatAttendanceDate(employee.dateHired)}.`;else
  if (employee && ctx.records.some((r) => r.employeeId === employee.id && r.date === v.date && r.id !== ctx.editingId))
  errors.date = 'This employee already has a record for this date. Edit that record instead.';

  if (!v.status) errors.status = 'Please select an attendance status.';

  const needsTimes = v.status === 'present' || v.status === 'late' || v.status === 'half_day';
  if (needsTimes || v.status === 'incomplete') {
    if (!v.checkIn) errors.checkIn = 'Check-in time is required for this status.';
  }
  if (needsTimes && !v.checkOut) errors.checkOut = 'Check-out time is required for completed attendance.';
  if (v.checkIn && v.checkOut && toMinutes(v.checkOut) <= toMinutes(v.checkIn))
  errors.checkOut = 'Check-out cannot be earlier than check-in.';
  if (v.status === 'incomplete' && v.checkIn && v.checkOut && !errors.checkOut)
  errors.status = 'Incomplete is for a check-in without a check-out. Choose another status or clear the check-out.';
  if (v.status === 'late' && v.checkIn && lateMinutes(v.checkIn, ctx.schedule) === 0)
  errors.checkIn = `Late requires a check-in after ${formatTime(ctx.schedule.expectedStart)}.`;

  return errors;
}
