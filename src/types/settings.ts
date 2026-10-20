export type DateFormat = 'MMM d, yyyy' | 'MM/dd/yyyy' | 'dd/MM/yyyy' | 'yyyy-MM-dd';
export type TimeFormat = '12h' | '24h';

export interface WorkSyncSettings {
  systemName: string;
  tagline: string;
  organizationName: string;
  organizationDescription: string;
  organizationEmail: string;
  landingPage: '/dashboard' | '/tasks';
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  weekStartsOn: 'sunday' | 'monday';
  theme: 'light';
  expectedStart: string;
  expectedEnd: string;
  lateThresholdMinutes: number;
  workingHoursPerDay: number;
  defaultTaskPriority: 'low' | 'medium' | 'high' | 'critical';
  defaultTaskStatus: 'todo' | 'in_progress' | 'in_review' | 'blocked';
  defaultProjectStatus: 'planning' | 'active' | 'on_hold';
  taskDueReminderDays: number;
  projectDeadlineReminderDays: number;
  notifications: { task: boolean; project: boolean; attendance: boolean; system: boolean };
}
