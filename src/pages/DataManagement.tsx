import { useMemo, useRef, useState } from 'react';
import { ArchiveIcon, DownloadIcon, FileUpIcon, RefreshCwIcon, ShieldCheckIcon, UploadIcon } from 'lucide-react';
import { useUsers } from '../contexts/UsersContext';
import { useEmployees } from '../contexts/EmployeesContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { useAttendance } from '../contexts/AttendanceContext';
import { useProjects } from '../contexts/ProjectsContext';
import { useTasks } from '../contexts/TasksContext';
import { useProgressReports } from '../contexts/ProgressReportsContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useActivity } from '../contexts/ActivityContext';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import { BACKUP_CATEGORIES, BACKUP_FORMAT_VERSION, type BackupCategory, type DataOperation, type ImportableCategory, type WorkSyncBackup } from '../types/backup';
import type { AppNotification } from '../types/notifications';
import type { WorkSyncSettings } from '../types/settings';
import { backupFilename, buildBackup, IMPORTABLE_CATEGORIES, MAX_IMPORT_BYTES, parseBackupText, recordsToCsv, validateImportCategory } from '../utils/backup';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog, type ConfirmRequest } from '../components/ui/ConfirmDialog';

const HISTORY_KEY = 'worksync.dataManagement.history.v1';
const countRecords = (value: unknown) => Array.isArray(value) ? value.length : value && typeof value === 'object' ? 1 : 0;
function readHistory(): DataOperation[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is DataOperation => Boolean(item) && typeof item === 'object' && ['export', 'import', 'restore'].includes((item as DataOperation).type) && typeof (item as DataOperation).timestamp === 'string').slice(0, 8) : [];
  } catch { return []; }
}

export function DataManagement() {
  const { users } = useUsers();
  const { employees } = useEmployees();
  const { positions } = useOrganization();
  const { records: attendance } = useAttendance();
  const { projects, members, activities: projectActivities } = useProjects();
  const { tasks, activities: taskActivities } = useTasks();
  const { reports: progressReports } = useProgressReports();
  const { allRecords: notifications, replaceNotifications } = useNotifications();
  const { logs } = useActivity();
  const { settings, saveSettings } = useSettings();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [history, setHistory] = useState<DataOperation[]>(readHistory);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [importBackup, setImportBackup] = useState<WorkSyncBackup | null>(null);
  const [chosen, setChosen] = useState<ImportableCategory[]>([]);
  const [preview, setPreview] = useState<Partial<Record<ImportableCategory, AppNotification[] | WorkSyncSettings>>>({});
  const [importConfirm, setImportConfirm] = useState<ConfirmRequest | null>(null);
  const [restoreConfirm, setRestoreConfirm] = useState<ConfirmRequest | null>(null);

  const exportData: WorkSyncBackup['data'] = useMemo(() => ({
    users: users.map((user) => { const safe = { ...user }; delete safe.mockPassword; return safe; }),
    employees,
    positions,
    attendance,
    projects,
    projectMembers: members,
    projectActivities,
    tasks,
    taskActivities,
    progressReports,
    notifications,
    activityLogs: logs,
    settings: { ...settings }
  }), [users, employees, positions, attendance, projects, members, projectActivities, tasks, taskActivities, progressReports, notifications, logs, settings]);
  const categoryCounts = useMemo(() => BACKUP_CATEGORIES.map((category) => ({ category, count: countRecords(exportData[category]) })), [exportData]);

  const track = (type: DataOperation['type'], categories: string[], result: DataOperation['result'], recordCount: number) => {
    const operation: DataOperation = { id: `DM-${Date.now()}`, type, categories, timestamp: new Date().toISOString(), result, recordCount };
    const next = [operation, ...history].slice(0, 8);
    setHistory(next);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* History is optional and does not affect the operation. */ }
  };

  const download = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const exportJson = () => {
    try {
      const file = buildBackup(exportData);
      download(new Blob([JSON.stringify(file, null, 2)], { type: 'application/json;charset=utf-8' }), backupFilename('full-backup', 'json'));
      track('export', file.metadata.categories, 'success', file.metadata.categories.reduce((sum, category) => sum + countRecords(file.data[category]), 0));
      toast({ title: 'Export started', description: 'Your WorkSync JSON file is being downloaded.' });
    } catch {
      track('export', ['all'], 'failure', 0); setError('The export could not be created. Try again.');
    }
  };
  const exportCsv = (category: BackupCategory) => {
    try {
      const data = exportData[category];
      const rows = Array.isArray(data) ? data : data ? [data] : [];
      download(new Blob([`\uFEFF${recordsToCsv(rows)}`], { type: 'text/csv;charset=utf-8' }), backupFilename(category, 'csv'));
      track('export', [category], 'success', rows.length);
      toast({ title: 'CSV export started', description: `${category} data is being downloaded.` });
    } catch {
      track('export', [category], 'failure', 0); setError(`The ${category} export could not be created.`);
    }
  };

  const validateSelected = (fileBackup: WorkSyncBackup, categories: ImportableCategory[]) => {
    const staged: typeof preview = {};
    for (const category of categories) {
      if (!fileBackup.metadata.categories.includes(category)) throw new Error(`The selected file does not include ${category}.`);
      const parsed = validateImportCategory(category, fileBackup.data[category]);
      if (category === 'notifications') {
        const notificationRows = parsed as AppNotification[];
        const accountIds = new Set(users.map((user) => user.id));
        for (const item of notificationRows) {
          if (item.recipientId !== 'admin' && !accountIds.has(item.recipientId)) throw new Error(`Notification ${item.id} refers to an unknown recipient.`);
          const ids = item.type === 'task' ? new Set(tasks.map((task) => task.id)) : item.type === 'project' ? new Set(projects.map((project) => project.id)) : null;
          if (item.relatedEntityId && ids && !ids.has(item.relatedEntityId)) throw new Error(`Notification ${item.id} refers to a missing ${item.type}.`);
        }
      }
      staged[category] = parsed as AppNotification[] | WorkSyncSettings;
    }
    return staged;
  };
  const onFile = async (file?: File) => {
    setError(''); setImportBackup(null); setChosen([]); setPreview({});
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.json') || file.size > MAX_IMPORT_BYTES) { setError(file.size > MAX_IMPORT_BYTES ? 'File is larger than the 5 MB import limit.' : 'Choose a WorkSync JSON backup file.'); return; }
    setBusy(true);
    try {
      const parsed = parseBackupText(await file.text());
      const eligible = IMPORTABLE_CATEGORIES.filter((category) => parsed.metadata.categories.includes(category));
      if (!eligible.length) throw new Error('This file contains no categories supported for safe import. Settings and notifications can be imported.');
      const staged = validateSelected(parsed, eligible);
      setImportBackup(parsed); setChosen(eligible); setPreview(staged);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'The file could not be validated.';
      setError(message); track('import', [], 'failure', 0);
    } finally { setBusy(false); if (inputRef.current) inputRef.current.value = ''; }
  };
  const toggleCategory = (category: ImportableCategory, checked: boolean) => {
    if (!importBackup) return;
    try {
      const nextChosen = checked ? [...chosen, category] : chosen.filter((item) => item !== category);
      setChosen(nextChosen); setPreview(validateSelected(importBackup, nextChosen)); setError('');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Import validation failed.'); }
  };
  const applyImport = () => {
    if (!chosen.length || !importBackup) return;
    try {
      if (chosen.includes('settings')) {
        const imported = preview.settings as WorkSyncSettings;
        if (!saveSettings(imported)) throw new Error('Settings could not be saved in browser storage; no notification changes were applied.');
      }
      if (chosen.includes('notifications')) replaceNotifications(preview.notifications as AppNotification[]);
      const count = chosen.reduce((sum, category) => sum + countRecords(preview[category]), 0);
      track('import', chosen, 'success', count); toast({ title: 'Import applied', description: `${count} records across ${chosen.length} selected categories were replaced.` });
      setImportBackup(null); setChosen([]); setPreview({}); setImportConfirm(null);
    } catch (cause) {
      track('import', chosen, 'failure', 0); setError(cause instanceof Error ? cause.message : 'The import could not be applied.'); setImportConfirm(null);
    }
  };
  const prepareImport = () => {
    if (!chosen.length || error) return;
    setImportConfirm({ title: 'Replace selected categories?', message: `This replaces ${chosen.join(' and ')} with validated data from the selected file. Other categories and your Admin session stay unchanged.`, confirmLabel: 'Apply import' });
  };
  const restore = () => {
    try {
      ['worksync.users.v1', 'worksync.employees.v1', 'worksync.tasks.v1', 'worksync.taskActivities.v1', 'worksync.progressReports.v1', 'worksync.notifications.v1'].forEach((key) => localStorage.removeItem(key));
      track('restore', [...BACKUP_CATEGORIES], 'success', categoryCounts.reduce((sum, item) => sum + item.count, 0));
      setRestoreConfirm(null); window.location.reload();
    } catch {
      track('restore', [...BACKUP_CATEGORIES], 'failure', 0); setError('Demo data could not be restored. Your current session remains active.'); setRestoreConfirm(null);
    }
  };
  const importedCount = (category: ImportableCategory) => countRecords(preview[category]);

  return <div className="space-y-6">
    <PageHeader title="Data Management" description="Export and manage WorkSync prototype data stored in this browser." />
    {error && <Alert tone="danger" title="Data operation needs attention">{error}</Alert>}
    <div className="grid gap-5 xl:grid-cols-2">
      <Card title="Export data" description="Download a versioned JSON snapshot of supported mock records. User passwords and credentials are excluded." action={<ArchiveIcon className="h-5 w-5 text-primary" />}>
        <div className="flex flex-wrap gap-2"><Button onClick={exportJson} leftIcon={<DownloadIcon className="h-4 w-4" />}>Export all data (JSON)</Button></div>
        <p className="mt-4 text-xs text-muted">Full export includes {BACKUP_CATEGORIES.length} data categories. Exports are manual browser downloads, not automatic or server backups.</p>
        <details className="mt-4 rounded-lg border border-line"><summary className="cursor-pointer px-3 py-2 text-sm font-medium text-ink">Individual CSV exports</summary><div className="flex flex-wrap gap-2 border-t border-line p-3">{(['users', 'employees', 'positions', 'attendance', 'projects', 'tasks', 'notifications'] as BackupCategory[]).map((category) => <Button key={category} size="sm" variant="secondary" onClick={() => exportCsv(category)}><DownloadIcon className="mr-1.5 h-3.5 w-3.5" />{category}</Button>)}</div></details>
      </Card>
      <Card title="Import data" description="Validate first, preview selected categories, then confirm replacement." action={<FileUpIcon className="h-5 w-5 text-primary" />}>
        <input ref={inputRef} type="file" accept="application/json,.json" aria-label="Select WorkSync backup JSON file" onChange={(event) => void onFile(event.target.files?.[0])} className="block w-full rounded-lg border border-line bg-surface p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary-soft file:px-3 file:py-1.5 file:font-medium file:text-primary" />
        <p className="mt-2 text-xs text-muted">JSON only · Maximum 5 MB · Supported imports: notifications and settings. Other categories are included for export but are not yet safely replaceable through app state.</p>
        {busy && <p role="status" className="mt-3 text-sm text-muted">Validating backup…</p>}
        {importBackup && <div className="mt-4 space-y-3 rounded-lg border border-line bg-bg p-4"><div><p className="text-sm font-semibold text-ink">Import preview</p><p className="mt-1 text-xs text-muted">Format v{BACKUP_FORMAT_VERSION} · Exported {new Date(importBackup.metadata.exportedAt).toLocaleString()}</p></div><div className="space-y-2">{IMPORTABLE_CATEGORIES.filter((category) => importBackup.metadata.categories.includes(category)).map((category) => <label key={category} className="flex items-center justify-between gap-3 rounded-md bg-surface px-3 py-2 text-sm"><span className="flex items-center gap-2"><input type="checkbox" checked={chosen.includes(category)} onChange={(event) => toggleCategory(category, event.target.checked)} className="h-4 w-4 accent-[#181B99]" />Replace {category}</span><span className="text-xs text-muted">{importedCount(category)} records</span></label>)}</div><Button onClick={prepareImport} disabled={!chosen.length || Boolean(error)} leftIcon={<UploadIcon className="h-4 w-4" />}>Review and apply selected</Button></div>}
      </Card>
      <Card title="Restore default demo data" description="Reinitialize seeded mock records and discard unsaved in-memory changes." action={<RefreshCwIcon className="h-5 w-5 text-warning" />}>
        <p className="text-sm leading-relaxed text-muted">This reloads the app with source-defined demo users, employees, positions, attendance, projects, tasks, weekly reports, notifications, and activity. The signed-in Admin session, System Settings, and data-management history are preserved.</p>
        <Button className="mt-4" variant="secondary" onClick={() => setRestoreConfirm({ title: 'Restore default demo data?', message: 'All in-memory mock data changes will be lost. The seeded Admin remains intact. Your System Settings and Admin session will be preserved.', confirmLabel: 'Restore demo data' })} leftIcon={<RefreshCwIcon className="h-4 w-4" />}>Restore default demo data</Button>
      </Card>
      <Card title="Data overview" description="Current records in application state. Derived reports are not counted as stored records." action={<ShieldCheckIcon className="h-5 w-5 text-primary" />}>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">{categoryCounts.map(({ category, count }) => <div key={category} className="rounded-lg bg-bg p-3"><dt className="truncate text-xs capitalize text-muted">{category.replace(/([A-Z])/g, ' $1')}</dt><dd className="mt-1 text-xl font-semibold tabular-nums text-ink">{count}</dd></div>)}</dl>
      </Card>
    </div>
    <Card title="Recent data operations" description="Local browser history only; this is not a tamper-proof audit trail.">
      {history.length ? <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead><tr className="border-b border-line text-xs uppercase tracking-wide text-muted"><th className="px-3 py-2">Operation</th><th className="px-3 py-2">Categories</th><th className="px-3 py-2">Records</th><th className="px-3 py-2">Result</th><th className="px-3 py-2">Time</th></tr></thead><tbody className="divide-y divide-line">{history.map((item) => <tr key={item.id}><td className="px-3 py-3 capitalize">{item.type}</td><td className="max-w-sm truncate px-3 py-3 text-muted">{item.categories.join(', ')}</td><td className="px-3 py-3 tabular-nums">{item.recordCount}</td><td className="px-3 py-3 capitalize">{item.result}</td><td className="px-3 py-3 text-muted">{new Date(item.timestamp).toLocaleString()}</td></tr>)}</tbody></table></div> : <EmptyState icon={ArchiveIcon} title="No operations yet" description="Successful exports, imports, and demo data restores will appear here." />}
    </Card>
    <p className="text-xs text-muted">Data Management is restricted by frontend role routing in this prototype. A production deployment would also require server-side authorization and durable backup infrastructure.</p>
    <ConfirmDialog request={importConfirm} onConfirm={applyImport} onClose={() => setImportConfirm(null)} />
    <ConfirmDialog request={restoreConfirm} onConfirm={restore} onClose={() => setRestoreConfirm(null)} />
  </div>;
}
