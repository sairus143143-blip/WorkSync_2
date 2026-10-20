import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BellIcon } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { cn } from '../../utils/cn';
import { Dropdown } from '../ui/Dropdown';
import { NotificationIcon } from '../notifications/NotificationIcon';
import { formatConfiguredDateTime } from '../../utils/settingsFormat';

export function NotificationMenu() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const recent = [...notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  return <Dropdown triggerLabel={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'} triggerClassName="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-ink/5 hover:text-ink" panelClassName="w-[min(380px,calc(100vw-2rem))] -right-12 sm:right-0" trigger={<><BellIcon className="h-[18px] w-[18px]" aria-hidden />{unreadCount > 0 && <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-danger px-1 text-center text-[10px] font-semibold leading-4 text-white ring-2 ring-surface">{unreadCount > 99 ? '99+' : unreadCount}</span>}</>} header={<div className="flex items-center justify-between border-b border-line px-4 py-3"><div><p className="text-sm font-semibold text-ink">Notifications</p><p className="text-xs text-muted">{unreadCount} unread</p></div>{unreadCount > 0 && <button type="button" onClick={markAllRead} className="text-xs font-medium text-primary hover:underline">Mark all read</button>}</div>}>
    {(close) => <><ul className="max-h-[360px] overflow-y-auto py-1">{recent.map((n) => <li key={n.id}><button type="button" role="menuitem" onClick={() => { markRead(n.id); close(); if (n.destination && /^\/(tasks|projects|attendance|dashboard)(\/|$)/.test(n.destination)) navigate(n.destination); }} className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-ink/[0.03] focus-visible:bg-ink/[0.04] focus-visible:outline-none"><NotificationIcon type={n.type} /><span className="min-w-0 flex-1"><span className={cn('block text-[13px] leading-snug', n.read ? 'text-muted' : 'font-medium text-ink')}>{n.title}</span><span className="mt-0.5 block truncate text-xs text-muted">{n.message}</span><time className="mt-1 block text-xs text-subtle">{formatConfiguredDateTime(n.createdAt)}</time></span>{!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}</button></li>)}</ul>{recent.length === 0 && <p className="px-5 py-8 text-center text-sm text-muted">You are all caught up.</p>}<div className="border-t border-line p-1.5"><Link to="/notifications" onClick={close} className="block rounded-lg px-3 py-2 text-center text-[13px] font-medium text-ink hover:bg-ink/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">View all notifications</Link></div></>}
  </Dropdown>;
}
