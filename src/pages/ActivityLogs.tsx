import React, { useMemo, useState } from 'react';
import { ClipboardListIcon, EyeIcon, RotateCcwIcon, SearchIcon } from 'lucide-react';
import { useActivity } from '../contexts/ActivityContext';
import type { ActivityLog } from '../types/notifications';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { formatConfiguredDateTime } from '../utils/settingsFormat';

const stamp = (value: string) => formatConfiguredDateTime(value);
const modules = ['Tasks', 'Projects', 'Users', 'Employees', 'Positions', 'Attendance', 'Reports'];

export function ActivityLogs() {
  const { logs } = useActivity();
  const [query, setQuery] = useState('');
  const [module, setModule] = useState('all');
  const [role, setRole] = useState('all');
  const [order, setOrder] = useState<'newest' | 'oldest'>('newest');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selected, setSelected] = useState<ActivityLog | null>(null);
  const rows = useMemo(() => logs.filter((entry) => (module === 'all' || entry.module === module) && (role === 'all' || entry.actorRole === role) && (!from || entry.timestamp.slice(0, 10) >= from) && (!to || entry.timestamp.slice(0, 10) <= to) && `${entry.actorName} ${entry.action} ${entry.description} ${entry.relatedRecord ?? ''}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => order === 'newest' ? b.timestamp.localeCompare(a.timestamp) : a.timestamp.localeCompare(b.timestamp)), [logs, module, role, from, to, query, order]);
  const clear = () => { setQuery(''); setModule('all'); setRole('all'); setFrom(''); setTo(''); setOrder('newest'); };
  return <div className="space-y-6">
    <PageHeader title="Activity Logs" description="Chronological mock activity from supported task and project actions." />
    <Card title="Activity history" description={`${rows.length} records · seeded entries are labeled as mock activity`}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><Input aria-label="Search activity" placeholder="Search actor, action or record" value={query} onChange={(e) => setQuery(e.target.value)} leftIcon={<SearchIcon className="h-4 w-4" />} /><Select label="Module" value={module} onChange={(e) => setModule(e.target.value)} options={[{ value: 'all', label: 'All modules' }, ...modules.map((value) => ({ value, label: value }))]} /><Select label="Actor role" value={role} onChange={(e) => setRole(e.target.value)} options={[{ value: 'all', label: 'All roles' }, { value: 'admin', label: 'Admin' }, { value: 'employee', label: 'Employee' }]} /><label className="flex flex-col gap-1.5 text-[13px] font-medium text-ink">From date<input aria-label="From date" type="date" className="h-9 rounded-lg border border-line bg-surface px-3 text-sm" value={from} onChange={(e) => setFrom(e.target.value)} /></label><label className="flex flex-col gap-1.5 text-[13px] font-medium text-ink">To date<input aria-label="To date" type="date" className="h-9 rounded-lg border border-line bg-surface px-3 text-sm" value={to} onChange={(e) => setTo(e.target.value)} /></label><div className="flex items-end gap-2"><Select label="Sort" value={order} onChange={(e) => setOrder(e.target.value as 'newest' | 'oldest')} options={[{ value: 'newest', label: 'Newest first' }, { value: 'oldest', label: 'Oldest first' }]} /><button type="button" onClick={clear} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 text-sm text-muted hover:bg-bg"><RotateCcwIcon className="h-3.5 w-3.5" />Clear</button></div></div>
      <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead><tr className="border-b border-line text-xs uppercase tracking-wide text-muted"><th className="px-3 py-3 font-medium">Actor</th><th className="px-3 py-3 font-medium">Action</th><th className="px-3 py-3 font-medium">Module</th><th className="px-3 py-3 font-medium">Related record</th><th className="px-3 py-3 font-medium">Timestamp</th><th className="px-3 py-3" /></tr></thead><tbody className="divide-y divide-line">{rows.map((entry) => <tr key={entry.id} className="hover:bg-bg/70"><td className="px-3 py-3"><span className="block font-medium text-ink">{entry.actorName}</span><span className="text-xs capitalize text-muted">{entry.actorRole}</span></td><td className="px-3 py-3"><span className="capitalize text-ink">{entry.action.replaceAll('_', ' ')}</span><span className="mt-0.5 block max-w-xs truncate text-xs text-muted">{entry.description}</span></td><td className="px-3 py-3 text-muted">{entry.module}</td><td className="px-3 py-3 text-muted">{entry.relatedRecord ?? '—'}</td><td className="px-3 py-3 whitespace-nowrap text-muted">{stamp(entry.timestamp)}{entry.mock && <span className="ml-2 rounded bg-bg px-1.5 py-0.5 text-[10px]">Mock</span>}</td><td className="px-3 py-3"><button type="button" onClick={() => setSelected(entry)} aria-label={`View details for ${entry.id}`} className="rounded-md p-2 text-muted hover:bg-primary-soft hover:text-primary"><EyeIcon className="h-4 w-4" /></button></td></tr>)}</tbody></table>{!rows.length && <EmptyState icon={ClipboardListIcon} title="No activity found" description="Try changing the search or filters." />}</div>
    </Card>
    <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Activity details" description={selected ? `${selected.id} · ${stamp(selected.timestamp)}` : undefined}>
      {selected && <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">{[['Actor', selected.actorName], ['Role', selected.actorRole], ['Action', selected.action.replaceAll('_', ' ')], ['Module', selected.module], ['Related record', selected.relatedRecord ?? '—'], ['Description', selected.description], ...Object.entries(selected.metadata ?? {}).map(([key, value]) => [key, value] as [string, string])].map(([label, value]) => <div key={label}><dt className="text-xs font-medium uppercase tracking-wide text-muted">{label}</dt><dd className="mt-1 text-sm text-ink">{value}</dd></div>)}</dl>}
    </Modal>
  </div>;
}
