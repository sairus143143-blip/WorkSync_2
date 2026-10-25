import type { Employee } from './employees';
import type { Position } from './organization';

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'on_leave' | 'half_day' | 'incomplete';

/** A stored attendance record. Times are 24h "HH:mm" strings; names are resolved via employeeId. */
export interface AttendanceRecord {
  id: string;
  employeeId: string;
  /** ISO date, yyyy-MM-dd */
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  notes: string;
}

/** Mock standard work schedule. Not a shift system. */
export interface WorkSchedule {
  /** The prototype's "today" — mock data is anchored to this date. */
  today: string;
  expectedStart: string;
  expectedEnd: string;
  lunchStart: string;
  lunchEnd: string;
  expectedDailyMinutes: number;
  /** Days worked below this are treated as a half day. */
  halfDayThresholdMinutes: number;
}

/**
 * One displayable row for an employee on a date. When no record exists, the row is
 * derived (absent, or on leave) so missing attendance is still visible.
 */
export interface AttendanceRow {
  key: string;
  date: string;
  employee: Employee;
  fullName: string;
  position?: Position;
  record?: AttendanceRecord;
  derived: boolean;
  status: AttendanceStatus;
  checkIn: string | null;
  checkOut: string | null;
  workedMinutes: number;
  lateMinutes: number;
  overtimeMinutes: number;
  notes: string;
}

export interface AttendanceFormValues {
  employeeId: string;
  date: string;
  status: AttendanceStatus | '';
  checkIn: string;
  checkOut: string;
  notes: string;
}

export type AttendanceFormErrors = Partial<Record<keyof AttendanceFormValues, string>>;

export type AttendanceStatusFilter = 'all' | AttendanceStatus;

export type DailySortKey = 'employee' | 'checkIn' | 'hours' | 'status';
export type HistorySortKey = 'date' | 'employee' | 'status' | 'hours';