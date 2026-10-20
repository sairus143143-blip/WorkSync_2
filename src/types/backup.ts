export const BACKUP_FORMAT_VERSION = 1;
export const BACKUP_APP_ID = 'worksync';
export const BACKUP_CATEGORIES = ['users', 'employees', 'departments', 'positions', 'adminAreas', 'positionAdminAssignments', 'attendance', 'projects', 'projectMembers', 'projectActivities', 'tasks', 'taskActivities', 'progressReports', 'notifications', 'activityLogs', 'settings'] as const;
export type BackupCategory = typeof BACKUP_CATEGORIES[number];
export type ImportableCategory = 'notifications' | 'settings';

export interface WorkSyncBackup {
  metadata: { application: typeof BACKUP_APP_ID; formatVersion: typeof BACKUP_FORMAT_VERSION; exportedAt: string; categories: BackupCategory[] };
  data: Partial<Record<BackupCategory, unknown[] | Record<string, unknown>>>;
}

export interface DataOperation {
  id: string;
  type: 'export' | 'import' | 'restore';
  categories: string[];
  timestamp: string;
  result: 'success' | 'failure';
  recordCount: number;
}
