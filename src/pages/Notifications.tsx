import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon, CheckCheckIcon, CheckIcon, SearchIcon, Trash2Icon } from 'lucide-react';
import { useNotifications, notificationTypeLabels } from '../contexts/NotificationContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { EmptyState } from '../components/ui/EmptyState';
import { NotificationIcon } from '../components/notifications/NotificationIcon';
import { cn } from '../utils/cn';
import { formatConfiguredDateTime } from '../utils/settingsFormat';

type ReadFilter = 'all' | 'unread' | 'read';
const dateLabel = (value: string) => formatConfiguredDateTime(value);

export function Notifications() {
  const { notifications, unreadCount, markRead, toggleRead, markAllRead, dismiss } = useNotifications();
  const navigate = useNavigate();
  const [tab, setTab] = useState<ReadFilter>('all');
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const rows = useMemo(() => notifications.filter((n) => (tab === 'all' || (tab === 'unread' ? !n.read : n.read)) && (type === 'all' || n.type === type) && `${n.title} ${n.message} ${n.relatedEntityId ?? ''}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [notifications, tab, type, query]);
  const activate = (id: string, destination?: string) => { markRead(id); if (destination && /^\/(tasks|projects|attendance|dashboard)(\/|$)/.test(destination)) navigate(destination); };

  return <div className="space-y-6">
    <PageHeader title="Notifications" description="Updates and reminders relevant to your WorkSync account." actions={<button type="button" disabled={!unreadCount} onClick={markAllRead} className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-medium text-ink hover:bg-bg disabled:cursor-not-allowed disabled:opacity-50"><CheckCheckIcon className="h-4 w-4" />Mark all as read</button>} />
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {[['Total', notifications.length], ['Unread', unreadCount], ['Read', notifications.length - unreadCount]].map(([label, value]) => <div key={label} className="rounded-xl border border-line bg-surface p-4"><p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p><p className="mt-1 text-2xl font-semibold text-ink">{value}</p></div>)}
    </div>
    <Card>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Notification status">
          {(['all', 'unread', 'read'] as ReadFilter[]).map((filter) => <button key={filter} role="tab" aria-selected={tab === filter} onClick={() => setTab(filter)} className={cn('rounded-lg px-3 py-2 text-sm font-medium capitalize', tab === filter ? 'bg-primary-soft text-primary' : 'text-muted hover:bg-bg')}>{filter}{filter === 'unread' ? ` (${unreadCount})` : ''}</button>)}
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_190px]"><Input aria-label="Search notifications" placeholder="Search notifications" value={query} onChange={(e) => setQuery(e.target.value)} leftIcon={<SearchIcon className="h-4 w-4" />} /><Select label="Notification type" hideLabel value={type} onChange={(e) => setType(e.target.value)} options={[{ value: 'all', label: 'All types' }, ...Object.entries(notificationTypeLabels).map(([value, label]) => ({ value, label }))]} /></div>
      </div>
      <div className="mt-4 divide-y divide-line">
        {rows.map((n) => <article key={n.id} className={cn('flex gap-3 rounded-lg px-3 py-4 sm:px-4', !n.read && 'bg-primary/[0.035]')}>
          <button type="button" onClick={() => activate(n.id, n.destination)} className="flex min-w-0 flex-1 items-start gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"><NotificationIcon type={n.type} /><span className="min-w-0"><span className="flex flex-wrap items-center gap-2"><span className={cn('text-sm', n.read ? 'font-medium text-ink' : 'font-semibold text-ink')}>{n.title}</span>{!n.read && <span className="h-2 w-2 rounded-full bg-primary" aria-label="Unread" />}{n.mock && <span className="rounded bg-bg px-1.5 py-0.5 text-[10px] text-muted">Mock</span>}</span><span className="mt-1 block text-sm leading-relaxed text-muted">{n.message}</span><time className="mt-2 block text-xs text-subtle" dateTime={n.createdAt}>{dateLabel(n.createdAt)}</time></span></button>
          <div className="flex shrink-0 items-start gap-1"><button type="button" className="rounded-md p-2 text-muted hover:bg-bg hover:text-ink" aria-label={n.read ? 'Mark as unread' : 'Mark as read'} onClick={() => toggleRead(n.id)}>{n.read ? <BellIcon className="h-4 w-4" /> : <CheckIcon className="h-4 w-4" />}</button><button type="button" className="rounded-md p-2 text-muted hover:bg-danger/5 hover:text-danger" aria-label="Dismiss notification" onClick={() => dismiss(n.id)}><Trash2Icon className="h-4 w-4" /></button></div>
        </article>)}
        {!rows.length && <EmptyState icon={BellIcon} title="No notifications found" description={query || tab !== 'all' || type !== 'all' ? 'Try changing your search or filters.' : 'You are all caught up.'} />}
      </div>
      <div className="mt-4 border-t border-line pt-4 text-xs text-muted">Mock notification data is local to this prototype. Related records open only when a supported destination exists.</div>
    </Card>
  </div>;
}
