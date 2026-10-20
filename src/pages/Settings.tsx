import React, { useEffect, useState } from 'react';
import { RotateCcwIcon, SaveIcon } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import { defaultSettings } from '../data/settings';
import type { WorkSyncSettings } from '../types/settings';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { ConfirmDialog, type ConfirmRequest } from '../components/ui/ConfirmDialog';
import { cn } from '../utils/cn';

type Section = 'general' | 'appearance' | 'format' | 'attendance' | 'workflow' | 'notifications';
const sections: Array<{ id: Section; label: string; note: string }> = [
  { id: 'general', label: 'General', note: 'System identity and organization profile' },
  { id: 'appearance', label: 'Appearance', note: 'Brand and display preferences' },
  { id: 'format', label: 'Date & time', note: 'Shared display formats' },
  { id: 'attendance', label: 'Attendance', note: 'Configured schedule preferences' },
  { id: 'workflow', label: 'Tasks & projects', note: 'Defaults for newly created work' },
  { id: 'notifications', label: 'Notifications', note: 'Global in-app categories' }
];
const taskPriorities = [{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }, { value: 'critical', label: 'Critical' }];
const taskStatuses = [{ value: 'todo', label: 'To Do' }, { value: 'in_progress', label: 'In Progress' }, { value: 'in_review', label: 'In Review' }, { value: 'blocked', label: 'Blocked' }];
const projectStatuses = [{ value: 'planning', label: 'Planning' }, { value: 'active', label: 'Active' }, { value: 'on_hold', label: 'On Hold' }];

export function Settings() {
  const { settings, saveSettings, resetSettings } = useSettings();
  const { toast } = useToast();
  const [draft, setDraft] = useState(settings);
  const [section, setSection] = useState<Section>('general');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmReset, setConfirmReset] = useState<ConfirmRequest | null>(null);
  const [notice, setNotice] = useState('');
  const dirty = JSON.stringify(draft) !== JSON.stringify(settings);
  useEffect(() => setDraft(settings), [settings]);
  const set = <K extends keyof WorkSyncSettings>(key: K, value: WorkSyncSettings[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const setNotification = (key: keyof WorkSyncSettings['notifications'], value: boolean) => setDraft((current) => ({ ...current, notifications: { ...current.notifications, [key]: value } }));
  const validate = () => {
    const next: Record<string, string> = {};
    if (!draft.systemName.trim()) next.systemName = 'System name is required.';
    if (!draft.tagline.trim()) next.tagline = 'Tagline is required.';
    if (draft.organizationEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.organizationEmail)) next.organizationEmail = 'Enter a valid email address or leave this blank.';
    if (!['/dashboard', '/tasks'].includes(draft.landingPage)) next.landingPage = 'Select a supported page.';
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(draft.expectedStart) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(draft.expectedEnd) || draft.expectedEnd <= draft.expectedStart) next.expectedEnd = 'End time must be later than start time.';
    if (!Number.isInteger(draft.lateThresholdMinutes) || draft.lateThresholdMinutes < 0 || draft.lateThresholdMinutes > 180) next.lateThresholdMinutes = 'Use a value from 0 to 180 minutes.';
    if (!Number.isFinite(draft.workingHoursPerDay) || draft.workingHoursPerDay < 1 || draft.workingHoursPerDay > 16) next.workingHoursPerDay = 'Use a value from 1 to 16 hours.';
    if (!Number.isInteger(draft.taskDueReminderDays) || draft.taskDueReminderDays < 0 || draft.taskDueReminderDays > 30) next.taskDueReminderDays = 'Use a value from 0 to 30 days.';
    if (!Number.isInteger(draft.projectDeadlineReminderDays) || draft.projectDeadlineReminderDays < 0 || draft.projectDeadlineReminderDays > 30) next.projectDeadlineReminderDays = 'Use a value from 0 to 30 days.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };
  const save = () => {
    setNotice('');
    if (!validate()) { setNotice('Fix the highlighted settings before saving.'); return; }
    if (saveSettings({ ...draft, systemName: draft.systemName.trim(), tagline: draft.tagline.trim(), organizationName: draft.organizationName.trim(), organizationEmail: draft.organizationEmail.trim() })) {
      setErrors({}); setNotice('Settings saved.'); toast({ title: 'Settings saved', description: 'Your WorkSync preferences are now active.' });
    } else setNotice('Settings could not be saved in this browser. Check storage permissions and try again.');
  };
  const cancel = () => { setDraft(settings); setErrors({}); setNotice('Unsaved changes discarded.'); };
  const reset = () => {
    if (resetSettings()) { setDraft(defaultSettings); setErrors({}); setNotice('Default settings restored.'); toast({ title: 'Settings reset', description: 'Defaults were restored. Other WorkSync data was not changed.' }); }
    else setNotice('Settings could not be reset in this browser.');
    setConfirmReset(null);
  };
  const error = (key: string) => errors[key];

  return <div className="space-y-6">
    <PageHeader title="System Settings" description="Configure WorkSync defaults for this browser prototype." actions={<><Button variant="secondary" onClick={cancel} disabled={!dirty} leftIcon={<RotateCcwIcon className="h-4 w-4" />}>Cancel</Button><Button onClick={save} disabled={!dirty} leftIcon={<SaveIcon className="h-4 w-4" />}>Save changes</Button></>} />
    {notice && <Alert tone={notice.includes('Fix') || notice.includes('could not') ? 'danger' : 'success'} title={notice} />}
    {dirty && <div role="status" className="rounded-lg border border-warning/20 bg-warning/5 px-4 py-2 text-sm text-warning">You have unsaved changes.</div>}
    <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
      <nav aria-label="Settings sections" className="flex gap-1 overflow-x-auto rounded-xl border border-line bg-surface p-2 lg:block lg:space-y-1 lg:self-start">{sections.map((item) => <button key={item.id} type="button" onClick={() => setSection(item.id)} aria-current={section === item.id ? 'page' : undefined} className={cn('min-w-max rounded-lg px-3 py-2 text-left text-sm transition-colors lg:block lg:w-full', section === item.id ? 'bg-primary-soft font-medium text-primary' : 'text-muted hover:bg-bg hover:text-ink')}><span className="block">{item.label}</span><span className="hidden text-xs font-normal text-subtle lg:block">{item.note}</span></button>)}</nav>
      <div className="space-y-5">
        {section === 'general' && <Card title="General system information" description="Set the product identity and optional organization profile."><div className="grid gap-4 sm:grid-cols-2"><Input label="System name" value={draft.systemName} onChange={(e) => set('systemName', e.target.value)} error={error('systemName')} maxLength={60} /><Input label="Tagline" value={draft.tagline} onChange={(e) => set('tagline', e.target.value)} error={error('tagline')} maxLength={100} /><Input label="Organization name (optional)" value={draft.organizationName} onChange={(e) => set('organizationName', e.target.value)} maxLength={100} /><Input label="Organization contact email (optional)" type="email" value={draft.organizationEmail} onChange={(e) => set('organizationEmail', e.target.value)} error={error('organizationEmail')} /><label className="flex flex-col gap-1.5 text-[13px] font-medium text-ink sm:col-span-2">Organization description (optional)<textarea className="min-h-24 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-normal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" value={draft.organizationDescription} onChange={(e) => set('organizationDescription', e.target.value)} maxLength={300} /></label><Select className="sm:col-span-2" label="Default landing page" value={draft.landingPage} onChange={(e) => set('landingPage', e.target.value as WorkSyncSettings['landingPage'])} options={[{ value: '/dashboard', label: 'Dashboard' }, { value: '/tasks', label: 'Tasks' }]} error={error('landingPage')} hint="Applied to the next successful sign-in. Current route behavior is unchanged." /></div></Card>}
        {section === 'appearance' && <Card title="Appearance" description="WorkSync uses its official light theme and brand palette."><div className="grid gap-4 sm:grid-cols-2"><div className="rounded-xl border border-line p-4"><p className="text-sm font-medium text-ink">Light theme</p><p className="mt-1 text-xs text-muted">Active across the app.</p><div className="mt-4 flex gap-2" aria-label="Official brand colors"><span className="h-8 w-8 rounded-full border border-line bg-[#181B99]" title="Primary blue" /><span className="h-8 w-8 rounded-full border border-line bg-[#F4BC3B]" title="Accent yellow" /><span className="h-8 w-8 rounded-full border border-line bg-[#443D6F]" title="Secondary gray-indigo" /><span className="h-8 w-8 rounded-full border border-line bg-white" title="White" /></div></div><div className="rounded-xl border border-line p-4"><p className="text-sm font-medium text-ink">Display density</p><p className="mt-1 text-xs text-muted">Comfortable spacing is used throughout WorkSync. Compact layout is not supported.</p></div></div></Card>}
        {section === 'format' && <Card title="Date and time" description="These choices apply to shared attendance and notification timestamps. Stored values are unchanged."><div className="grid gap-4 sm:grid-cols-2"><Select label="Date format" value={draft.dateFormat} onChange={(e) => set('dateFormat', e.target.value as WorkSyncSettings['dateFormat'])} options={[{ value: 'MMM d, yyyy', label: 'Oct 15, 2026' }, { value: 'MM/dd/yyyy', label: '10/15/2026' }, { value: 'dd/MM/yyyy', label: '15/10/2026' }, { value: 'yyyy-MM-dd', label: '2026-10-15' }]} /><Select label="Time format" value={draft.timeFormat} onChange={(e) => set('timeFormat', e.target.value as WorkSyncSettings['timeFormat'])} options={[{ value: '12h', label: '12-hour (5:00 PM)' }, { value: '24h', label: '24-hour (17:00)' }]} /><Select label="First day of the week" value={draft.weekStartsOn} onChange={(e) => set('weekStartsOn', e.target.value as WorkSyncSettings['weekStartsOn'])} options={[{ value: 'monday', label: 'Monday' }, { value: 'sunday', label: 'Sunday' }]} /><p className="self-center text-xs text-muted">Week-start preference is saved for future calendar views.</p></div></Card>}
        {section === 'attendance' && <Card title="Attendance configuration" description="These settings document the preferred schedule for this prototype."><div className="grid gap-4 sm:grid-cols-2"><Input label="Expected work start" type="time" value={draft.expectedStart} onChange={(e) => set('expectedStart', e.target.value)} /><Input label="Expected work end" type="time" value={draft.expectedEnd} onChange={(e) => set('expectedEnd', e.target.value)} error={error('expectedEnd')} /><Input label="Late threshold (minutes)" type="number" min={0} max={180} value={draft.lateThresholdMinutes} onChange={(e) => set('lateThresholdMinutes', Number(e.target.value))} error={error('lateThresholdMinutes')} /><Input label="Standard hours per day" type="number" min={1} max={16} step={0.5} value={draft.workingHoursPerDay} onChange={(e) => set('workingHoursPerDay', Number(e.target.value))} error={error('workingHoursPerDay')} /></div><p className="mt-4 rounded-lg bg-bg p-3 text-xs leading-relaxed text-muted">Current attendance calculations use the seeded 8:00 AM–5:00 PM schedule. These preferences do not recalculate or alter existing attendance records.</p></Card>}
        {section === 'workflow' && <Card title="Task and project defaults" description="Defaults apply only when creating new records."><div className="grid gap-4 sm:grid-cols-2"><Select label="Default task priority" value={draft.defaultTaskPriority} onChange={(e) => set('defaultTaskPriority', e.target.value as WorkSyncSettings['defaultTaskPriority'])} options={taskPriorities} /><Select label="Default task status" value={draft.defaultTaskStatus} onChange={(e) => set('defaultTaskStatus', e.target.value as WorkSyncSettings['defaultTaskStatus'])} options={taskStatuses} /><Select label="Default project status" value={draft.defaultProjectStatus} onChange={(e) => set('defaultProjectStatus', e.target.value as WorkSyncSettings['defaultProjectStatus'])} options={projectStatuses} /><Input label="Task due reminder (days before)" type="number" min={0} max={30} value={draft.taskDueReminderDays} onChange={(e) => set('taskDueReminderDays', Number(e.target.value))} error={error('taskDueReminderDays')} /><Input label="Project deadline reminder (days before)" type="number" min={0} max={30} value={draft.projectDeadlineReminderDays} onChange={(e) => set('projectDeadlineReminderDays', Number(e.target.value))} error={error('projectDeadlineReminderDays')} /></div><p className="mt-4 text-xs text-muted">Reminder intervals are stored as configuration; automatic deadline notices are not generated by the current mock app.</p></Card>}
        {section === 'notifications' && <Card title="In-app notification preferences" description="Global preferences apply to notification creation and display for all accounts in this browser."><div className="divide-y divide-line">{([['task', 'Task updates', 'Assignments, changes, and due reminders'], ['project', 'Project updates', 'Project status and deadline reminders'], ['attendance', 'Attendance', 'Attendance reminders and status updates'], ['system', 'System notices', 'General WorkSync information']] as const).map(([key, title, description]) => <label key={key} className="flex cursor-pointer items-start justify-between gap-4 py-4"><span><span className="block text-sm font-medium text-ink">{title}</span><span className="mt-0.5 block text-xs text-muted">{description}</span></span><input type="checkbox" checked={draft.notifications[key]} onChange={(e) => setNotification(key, e.target.checked)} aria-label={`Enable ${title}`} className="mt-0.5 h-4 w-4 accent-[#181B99]" /></label>)}</div></Card>}
        <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-muted">Settings are saved in this browser only. No account secrets are stored.</p><Button variant="ghost" onClick={() => setConfirmReset({ title: 'Reset WorkSync settings?', message: 'This restores default preferences without changing employees, attendance, projects, tasks, or notification records.', confirmLabel: 'Reset settings' })} leftIcon={<RotateCcwIcon className="h-4 w-4" />}>Reset to defaults</Button></div>
      </div>
    </div>
    <ConfirmDialog request={confirmReset} onConfirm={reset} onClose={() => setConfirmReset(null)} />
  </div>;
}
