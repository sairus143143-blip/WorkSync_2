import type { LucideIcon } from 'lucide-react';
import type { StatTone } from './ui';

export interface SummaryStat {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
  hint: string;
  tone: StatTone;
  delta?: string;
  trend?: 'up' | 'down' | 'flat';
  positive?: boolean;
  featured?: boolean;
}

export type AttendancePeriod = 'today' | 'yesterday' | 'week' | 'month';

export interface AttendanceSnapshot {
  label: string;
  /** Explains how the numbers are counted for this period. */
  caption: string;
  present: number;
  late: number;
  absent: number;
  leave: number;
  comparison: string;
}

export type ProjectStatus = 'On track' | 'At risk' | 'Delayed' | 'Completed';

export interface ProjectSnapshot {
  id: string;
  name: string;
  lead: string;
  team: string;
  progress: number;
  status: ProjectStatus;
  deadline: string;
  deadlineNote: string;
}

export interface TaskStatusCount {
  id: 'todo' | 'progress' | 'completed' | 'blocked' | 'overdue';
  label: string;
  count: number;
}

export type ActivityType = 'task' | 'assignment' | 'attendance' | 'project' | 'deadline';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  actor?: string;
  action: string;
  target: string;
  time: string;
}

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type WorkStatus = 'To do' | 'In progress' | 'In review' | 'Blocked';

export interface DeadlineItem {
  id: string;
  name: string;
  kind: 'Task' | 'Project';
  project?: string;
  assignee: string;
  due: string;
  dueIn: string;
  priority: Priority;
  status: WorkStatus;
}

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  path: string;
  icon: LucideIcon;
}