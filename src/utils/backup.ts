import { BACKUP_APP_ID, BACKUP_CATEGORIES, BACKUP_FORMAT_VERSION, type BackupCategory, type ImportableCategory, type WorkSyncBackup } from '../types/backup';
import type { AppNotification } from '../types/notifications';
import type { WorkSyncSettings } from '../types/settings';
import { defaultSettings } from '../data/settings';

export const MAX_IMPORT_BYTES = 5 * 1024 * 1024;
export const IMPORTABLE_CATEGORIES: ImportableCategory[] = ['notifications', 'settings'];

export function buildBackup(data: WorkSyncBackup['data']): WorkSyncBackup {
  return { metadata: { application: BACKUP_APP_ID, formatVersion: BACKUP_FORMAT_VERSION, exportedAt: new Date().toISOString(), categories: BACKUP_CATEGORIES.filter((category) => data[category] !== undefined) }, data };
}

export function parseBackupText(text: string): WorkSyncBackup {
  let parsed: unknown;
  try { parsed = JSON.parse(text); } catch { throw new Error('This file is not valid JSON.'); }
  if (!parsed || typeof parsed !== 'object') throw new Error('The backup must be a JSON object.');
  const backup = parsed as Partial<WorkSyncBackup>;
  if (backup.metadata?.application !== BACKUP_APP_ID) throw new Error('This file was not exported by WorkSync.');
  if (backup.metadata?.formatVersion !== BACKUP_FORMAT_VERSION) throw new Error('This backup format version is not supported.');
  if (!isIsoDateTime(backup.metadata.exportedAt)) throw new Error('The backup export timestamp is invalid.');
  if (!Array.isArray(backup.metadata.categories) || !backup.data || typeof backup.data !== 'object') throw new Error('The backup is missing its categories or data.');
  const categories = backup.metadata.categories;
  if (categories.some((category) => !BACKUP_CATEGORIES.includes(category as BackupCategory))) throw new Error('The backup contains an unsupported data category.');
  for (const category of categories) if (!(category in backup.data)) throw new Error(`The backup is missing the ${category} data listed in its metadata.`);
  return backup as WorkSyncBackup;
}

function isIsoDateTime(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value)) && /^\d{4}-\d{2}-\d{2}T/.test(value);
}

function validateNotifications(value: unknown): AppNotification[] {
  if (!Array.isArray(value)) throw new Error('Notifications must be an array.');
  const ids = new Set<string>();
  const types = ['attendance', 'task', 'project', 'system'];
  const rows = value.map((raw, index) => {
    if (!raw || typeof raw !== 'object') throw new Error(`Notification ${index + 1} is not an object.`);
    const row = raw as Record<string, unknown>;
    if (typeof row.id !== 'string' || !row.id.trim()) throw new Error(`Notification ${index + 1} is missing an ID.`);
    if (ids.has(row.id)) throw new Error(`Duplicate notification ID: ${row.id}.`);
    ids.add(row.id);
    if (typeof row.title !== 'string' || typeof row.message !== 'string') throw new Error(`Notification ${row.id} needs a title and message.`);
    if (!types.includes(String(row.type))) throw new Error(`Notification ${row.id} has an unsupported type.`);
    if (typeof row.recipientId !== 'string' || !row.recipientId) throw new Error(`Notification ${row.id} needs a recipient ID.`);
    if (!isIsoDateTime(row.createdAt) || typeof row.read !== 'boolean') throw new Error(`Notification ${row.id} has an invalid timestamp or read state.`);
    if (row.destination !== undefined && (typeof row.destination !== 'string' || !/^\/(dashboard|tasks|my-tasks|my-reports|weekly-reports|projects|attendance)(\/|$)/.test(row.destination))) throw new Error(`Notification ${row.id} has an unsupported destination.`);
    return row as unknown as AppNotification;
  });
  return rows;
}

function validateSettings(value: unknown): WorkSyncSettings {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Settings must be an object.');
  const candidate = value as Partial<WorkSyncSettings>;
  const lateThreshold = candidate.lateThresholdMinutes;
  const taskReminder = candidate.taskDueReminderDays;
  const projectReminder = candidate.projectDeadlineReminderDays;
  if (typeof candidate.systemName !== 'string' || !candidate.systemName.trim() || typeof candidate.tagline !== 'string') throw new Error('Settings need a system name and tagline.');
  if (typeof candidate.organizationName !== 'string' || typeof candidate.organizationDescription !== 'string' || typeof candidate.organizationEmail !== 'string') throw new Error('Settings contain invalid organization fields.');
  if (candidate.organizationEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate.organizationEmail)) throw new Error('Settings contain an invalid organization email.');
  if (!['/dashboard', '/tasks'].includes(candidate.landingPage ?? '')) throw new Error('Settings contain an unsupported landing page.');
  if (!['MMM d, yyyy', 'MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd'].includes(candidate.dateFormat ?? '')) throw new Error('Settings contain an unsupported date format.');
  if (candidate.timeFormat !== '12h' && candidate.timeFormat !== '24h') throw new Error('Settings contain an unsupported time format.');
  if (candidate.weekStartsOn !== 'monday' && candidate.weekStartsOn !== 'sunday') throw new Error('Settings contain an unsupported week-start preference.');
  if (candidate.theme !== 'light') throw new Error('This WorkSync version supports only the light theme.');
  if (typeof candidate.expectedStart !== 'string' || typeof candidate.expectedEnd !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(candidate.expectedStart) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(candidate.expectedEnd) || candidate.expectedEnd <= candidate.expectedStart) throw new Error('Settings contain an invalid attendance time range.');
  if (typeof lateThreshold !== 'number' || !Number.isInteger(lateThreshold) || lateThreshold < 0 || lateThreshold > 180 || typeof candidate.workingHoursPerDay !== 'number' || candidate.workingHoursPerDay < 1 || candidate.workingHoursPerDay > 16) throw new Error('Settings contain invalid attendance configuration values.');
  if (!['low', 'medium', 'high', 'critical'].includes(candidate.defaultTaskPriority ?? '') || !['todo', 'in_progress', 'in_review', 'blocked'].includes(candidate.defaultTaskStatus ?? '') || !['planning', 'active', 'on_hold'].includes(candidate.defaultProjectStatus ?? '')) throw new Error('Settings contain an unsupported task or project default.');
  if (typeof taskReminder !== 'number' || !Number.isInteger(taskReminder) || taskReminder < 0 || taskReminder > 30 || typeof projectReminder !== 'number' || !Number.isInteger(projectReminder) || projectReminder < 0 || projectReminder > 30) throw new Error('Settings contain invalid reminder intervals.');
  if (!candidate.notifications || ['task', 'project', 'attendance', 'system'].some((key) => typeof candidate.notifications?.[key as keyof WorkSyncSettings['notifications']] !== 'boolean')) throw new Error('Settings are missing valid notification preferences.');
  return { ...defaultSettings, ...candidate, notifications: { ...candidate.notifications } } as WorkSyncSettings;
}

export function validateImportCategory(category: ImportableCategory, value: unknown): AppNotification[] | WorkSyncSettings {
  return category === 'notifications' ? validateNotifications(value) : validateSettings(value);
}

export function csvEscape(value: unknown): string {
  const text = value === null || value === undefined ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function recordsToCsv(records: unknown[]): string {
  if (!records.length) return 'No records\r\n';
  const rows = records.filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object' && !Array.isArray(row));
  if (!rows.length) return 'No records\r\n';
  const headers = Object.keys(rows[0]);
  return [headers.map(csvEscape).join(','), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(','))].join('\r\n');
}

export function backupFilename(category: string, extension: 'json' | 'csv', date = new Date()): string {
  const day = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return `worksync-${category}-${day}.${extension}`;
}
