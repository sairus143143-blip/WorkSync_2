export type NotificationType = 'attendance' | 'task' | 'project' | 'system';
export type NotificationRecipient = 'admin' | string;

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  type: NotificationType;
  recipientId: NotificationRecipient;
  read: boolean;
  relatedEntityId?: string;
  destination?: string;
  mock?: boolean;
  dismissed?: boolean;
}

export type ActivityModule = 'Tasks' | 'Projects' | 'Users' | 'Employees' | 'Departments' | 'Positions' | 'Attendance' | 'Reports';

export interface ActivityLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: 'admin' | 'employee';
  action: string;
  module: ActivityModule;
  description: string;
  relatedRecord?: string;
  timestamp: string;
  metadata?: Record<string, string>;
  mock?: boolean;
}
