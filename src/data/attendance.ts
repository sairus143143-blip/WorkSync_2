import { eachDayOfInterval, format, isWeekend, parseISO } from 'date-fns';
import type { AttendanceRecord } from '../types/attendance';
import { employees } from './employees';

/** Today's records (Monday, October 5, 2026), written out explicitly. Missing employees show as absent / on leave. */
const todayRecords: AttendanceRecord[] = [
{ id: 'ATT-2026-10-05-EMP-001', employeeId: 'EMP-001', date: '2026-10-05', checkIn: '08:17', checkOut: '17:12', status: 'late', notes: 'Traffic delay.' },
{ id: 'ATT-2026-10-05-EMP-002', employeeId: 'EMP-002', date: '2026-10-05', checkIn: '07:55', checkOut: '17:02', status: 'present', notes: '' },
{ id: 'ATT-2026-10-05-EMP-003', employeeId: 'EMP-003', date: '2026-10-05', checkIn: '07:58', checkOut: '17:03', status: 'present', notes: '' },
{ id: 'ATT-2026-10-05-EMP-005', employeeId: 'EMP-005', date: '2026-10-05', checkIn: '07:50', checkOut: '18:15', status: 'present', notes: 'Stayed to finish the campaign launch.' },
{ id: 'ATT-2026-10-05-EMP-006', employeeId: 'EMP-006', date: '2026-10-05', checkIn: '08:32', checkOut: '17:05', status: 'late', notes: '' },
{ id: 'ATT-2026-10-05-EMP-007', employeeId: 'EMP-007', date: '2026-10-05', checkIn: null, checkOut: null, status: 'on_leave', notes: 'Approved vacation leave.' },
{ id: 'ATT-2026-10-05-EMP-008', employeeId: 'EMP-008', date: '2026-10-05', checkIn: '07:59', checkOut: null, status: 'incomplete', notes: 'No check-out recorded.' },
{ id: 'ATT-2026-10-05-EMP-010', employeeId: 'EMP-010', date: '2026-10-05', checkIn: '08:00', checkOut: '12:30', status: 'half_day', notes: 'Medical appointment in the afternoon.' },
{ id: 'ATT-2026-10-05-EMP-011', employeeId: 'EMP-011', date: '2026-10-05', checkIn: '07:45', checkOut: '17:30', status: 'present', notes: '' },
{ id: 'ATT-2026-10-05-EMP-014', employeeId: 'EMP-014', date: '2026-10-05', checkIn: '08:05', checkOut: '17:00', status: 'late', notes: '' },
{ id: 'ATT-2026-10-05-EMP-015', employeeId: 'EMP-015', date: '2026-10-05', checkIn: '07:52', checkOut: '17:10', status: 'present', notes: '' }];


/** Approved leave windows used by the history generator. */
const leaveFrom: Record<string, string> = { 'EMP-004': '2026-09-28', 'EMP-007': '2026-10-01' };

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function clock(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

/**
 * Deterministic mock history for the three weeks before today (weekdays only).
 * The same inputs always produce the same records, so the prototype is stable between reloads.
 */
function generateHistory(): AttendanceRecord[] {
  const days = eachDayOfInterval({ start: parseISO('2026-09-14'), end: parseISO('2026-10-02') }).filter((d) => !isWeekend(d));
  const records: AttendanceRecord[] = [];

  for (const day of days) {
    const date = format(day, 'yyyy-MM-dd');
    for (const e of employees) {
      if (e.employmentStatus === 'inactive' || e.dateHired > date) continue;
      const id = `ATT-${date}-${e.id}`;
      if (leaveFrom[e.id] && date >= leaveFrom[e.id]) {
        records.push({ id, employeeId: e.id, date, checkIn: null, checkOut: null, status: 'on_leave', notes: 'Approved leave.' });
        continue;
      }
      const roll = hash(id) % 100;
      const jitter = hash(`${id}-t`) % 20;
      if (roll < 70) {
        records.push({ id, employeeId: e.id, date, checkIn: clock(465 + jitter % 15), checkOut: clock(1020 + jitter), status: 'present', notes: '' });
      } else if (roll < 82) {
        records.push({ id, employeeId: e.id, date, checkIn: clock(485 + jitter * 2), checkOut: clock(1022 + jitter), status: 'late', notes: '' });
      } else if (roll < 89) {
        records.push({ id, employeeId: e.id, date, checkIn: clock(470 + jitter % 10), checkOut: clock(1065 + jitter * 3), status: 'present', notes: 'Overtime to meet a deadline.' });
      } else if (roll < 93) {
        records.push({ id, employeeId: e.id, date, checkIn: clock(478), checkOut: clock(720 + jitter), status: 'half_day', notes: 'Approved half day.' });
      } else if (roll < 96) {
        records.push({ id, employeeId: e.id, date, checkIn: clock(472 + jitter % 8), checkOut: null, status: 'incomplete', notes: 'Missed check-out.' });
      }
      // Remaining rolls have no record and appear as absent.
    }
  }
  return records;
}

export const attendanceRecords: AttendanceRecord[] = [...generateHistory(), ...todayRecords];