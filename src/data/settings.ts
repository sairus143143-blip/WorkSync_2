import type { WorkSyncSettings } from '../types/settings';

export const SETTINGS_STORAGE_KEY = 'worksync.systemSettings.v1';

export const defaultSettings: WorkSyncSettings = {
  systemName: 'WorkSync',
  tagline: 'Connect. Manage. Accomplish.',
  organizationName: '',
  organizationDescription: '',
  organizationEmail: '',
  landingPage: '/dashboard',
  dateFormat: 'MMM d, yyyy',
  timeFormat: '12h',
  weekStartsOn: 'monday',
  theme: 'light',
  expectedStart: '08:00',
  expectedEnd: '17:00',
  lateThresholdMinutes: 0,
  workingHoursPerDay: 8,
  defaultTaskPriority: 'medium',
  defaultTaskStatus: 'todo',
  defaultProjectStatus: 'planning',
  taskDueReminderDays: 2,
  projectDeadlineReminderDays: 7,
  notifications: { task: true, project: true, attendance: true, system: true }
};

const dateFormats = ['MMM d, yyyy', 'MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd'];
const priorities = ['low', 'medium', 'high', 'critical'];
const taskStatuses = ['todo', 'in_progress', 'in_review', 'blocked'];
const projectStatuses = ['planning', 'active', 'on_hold'];

export function parseSettings(raw: string | null): WorkSyncSettings {
  if (!raw) return defaultSettings;
  try {
    const value = JSON.parse(raw) as Partial<WorkSyncSettings>;
    const number = (candidate: unknown, fallback: number, min: number, max: number) => typeof candidate === 'number' && Number.isFinite(candidate) && candidate >= min && candidate <= max ? candidate : fallback;
    const validTime = (candidate: unknown, fallback: string) => typeof candidate === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(candidate) ? candidate : fallback;
    const notif = value.notifications;
    return {
      ...defaultSettings,
      ...value,
      systemName: typeof value.systemName === 'string' && value.systemName.trim() ? value.systemName : defaultSettings.systemName,
      tagline: typeof value.tagline === 'string' ? value.tagline : defaultSettings.tagline,
      organizationName: typeof value.organizationName === 'string' ? value.organizationName : '',
      organizationDescription: typeof value.organizationDescription === 'string' ? value.organizationDescription : '',
      organizationEmail: typeof value.organizationEmail === 'string' ? value.organizationEmail : '',
      landingPage: value.landingPage === '/tasks' ? '/tasks' : '/dashboard',
      dateFormat: dateFormats.includes(value.dateFormat ?? '') ? value.dateFormat! : defaultSettings.dateFormat,
      timeFormat: value.timeFormat === '24h' ? '24h' : '12h',
      weekStartsOn: value.weekStartsOn === 'sunday' ? 'sunday' : 'monday',
      theme: 'light',
      expectedStart: validTime(value.expectedStart, defaultSettings.expectedStart),
      expectedEnd: validTime(value.expectedEnd, defaultSettings.expectedEnd),
      lateThresholdMinutes: number(value.lateThresholdMinutes, defaultSettings.lateThresholdMinutes, 0, 180),
      workingHoursPerDay: number(value.workingHoursPerDay, defaultSettings.workingHoursPerDay, 1, 16),
      defaultTaskPriority: priorities.includes(value.defaultTaskPriority ?? '') ? value.defaultTaskPriority! : defaultSettings.defaultTaskPriority,
      defaultTaskStatus: taskStatuses.includes(value.defaultTaskStatus ?? '') ? value.defaultTaskStatus! : defaultSettings.defaultTaskStatus,
      defaultProjectStatus: projectStatuses.includes(value.defaultProjectStatus ?? '') ? value.defaultProjectStatus! : defaultSettings.defaultProjectStatus,
      taskDueReminderDays: number(value.taskDueReminderDays, defaultSettings.taskDueReminderDays, 0, 30),
      projectDeadlineReminderDays: number(value.projectDeadlineReminderDays, defaultSettings.projectDeadlineReminderDays, 0, 30),
      notifications: { task: notif?.task !== false, project: notif?.project !== false, attendance: notif?.attendance !== false, system: notif?.system !== false }
    };
  } catch {
    return defaultSettings;
  }
}
