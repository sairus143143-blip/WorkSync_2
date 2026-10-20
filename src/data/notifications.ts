import type { AppNotification } from '../types/notifications';

/** Clearly labeled mock notices tied to the seeded task dataset and demo accounts. */
export const notifications: AppNotification[] = [
  { id: 'n1', title: 'Task due soon', message: 'Log Aggregation Config (TSK-042) is due on Oct 15.', type: 'task', recipientId: 'USR-002', relatedEntityId: 'TSK-042', destination: '/my-tasks', createdAt: '2026-10-14T09:00:00', read: false, mock: true },
  { id: 'n2', title: 'Task overdue', message: 'Implement Login Validation (TSK-001) is past its due date.', type: 'task', recipientId: 'USR-002', relatedEntityId: 'TSK-001', destination: '/my-tasks', createdAt: '2026-10-13T09:00:00', read: false, mock: true },
  { id: 'n3', title: 'WorkSync activity summary', message: 'Review recent task and project updates in WorkSync.', type: 'system', recipientId: 'USR-001', destination: '/dashboard', createdAt: '2026-10-12T08:30:00', read: false, mock: true },
  { id: 'n4', title: 'Task completed', message: 'Write Unit Tests (TSK-004) is marked complete.', type: 'task', recipientId: 'USR-002', relatedEntityId: 'TSK-004', destination: '/my-tasks', createdAt: '2026-10-10T16:20:00', read: true, mock: true },
  { id: 'n5', title: 'WorkSync notifications are ready', message: 'Task updates and reminders for your account appear here.', type: 'system', recipientId: 'USR-003', destination: '/my-tasks', createdAt: '2026-10-11T09:00:00', read: false, mock: true }
];
