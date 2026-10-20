import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { notifications as seedNotifications } from '../data/notifications';
import type { AppNotification, NotificationType } from '../types/notifications';
import { useAuth } from './AuthContext';
import { useSettings } from './SettingsContext';

interface NotificationContextValue {
  notifications: AppNotification[];
  allRecords: AppNotification[];
  unreadCount: number;
  totalCount: number;
  markRead: (id: string) => void;
  toggleRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'> & { id?: string }) => void;
  replaceNotifications: (notifications: AppNotification[]) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);
const STORAGE_KEY = 'worksync.notifications.v1';

function readNotifications(): AppNotification[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return seedNotifications;
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed as AppNotification[] : seedNotifications;
  } catch {
    return seedNotifications;
  }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<AppNotification[]>(readNotifications);
  const { user } = useAuth();
  const { settings } = useSettings();
  const visible = useMemo(() => items.filter((item) => !item.dismissed && settings.notifications[item.type] && (user?.role === 'admin' ? item.recipientId === 'admin' || item.recipientId === user.id : item.recipientId === user?.id)), [items, user, settings.notifications]);

  const markRead = useCallback((id: string) => {
    setItems((list) => list.map((n) => n.id === id && (n.recipientId === 'admin' && user?.role === 'admin' || n.recipientId === user?.id) ? { ...n, read: true } : n));
  }, [user]);
  const toggleRead = useCallback((id: string) => {
    setItems((list) => list.map((n) => n.id === id && (n.recipientId === 'admin' && user?.role === 'admin' || n.recipientId === user?.id) ? { ...n, read: !n.read } : n));
  }, [user]);
  const markAllRead = useCallback(() => {
    setItems((list) => list.map((n) => visible.some((item) => item.id === n.id) ? { ...n, read: true } : n));
  }, [visible]);
  const dismiss = useCallback((id: string) => {
    setItems((list) => list.map((n) => visible.some((item) => item.id === n.id) && n.id === id ? { ...n, dismissed: true } : n));
  }, [visible]);
  const addNotification = useCallback((input: Omit<AppNotification, 'id' | 'createdAt' | 'read'> & { id?: string }) => {
    if (!settings.notifications[input.type]) return;
    const createdAt = new Date().toISOString();
    setItems((list) => [{ ...input, id: input.id ?? `N-${Date.now()}`, createdAt, read: false }, ...list]);
  }, [settings.notifications]);
  const replaceNotifications = useCallback((next: AppNotification[]) => setItems(next), []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage may be unavailable in a sandboxed preview.
    }
  }, [items]);

  const value = useMemo(() => ({ notifications: visible, allRecords: items, unreadCount: visible.filter((n) => !n.read).length, totalCount: visible.length, markRead, toggleRead, markAllRead, dismiss, addNotification, replaceNotifications }), [visible, items, markRead, toggleRead, markAllRead, dismiss, addNotification, replaceNotifications]);
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used inside NotificationProvider');
  return context;
}

export const notificationTypeLabels: Record<NotificationType, string> = { attendance: 'Attendance', task: 'Task', project: 'Project', system: 'System' };
