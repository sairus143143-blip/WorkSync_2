import type { WorkSchedule } from '../types/attendance';

/** Mock standard schedule for the prototype. Replace with real configuration later. */
export const workSchedule: WorkSchedule = {
  today: '2026-10-05',
  expectedStart: '08:00',
  expectedEnd: '17:00',
  lunchStart: '12:00',
  lunchEnd: '13:00',
  expectedDailyMinutes: 8 * 60,
  halfDayThresholdMinutes: 5 * 60
};