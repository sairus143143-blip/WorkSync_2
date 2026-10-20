import {
  CalendarCheckIcon,
  ClockIcon,
  FilePlus2Icon,
  FolderKanbanIcon,
  FolderPlusIcon,
  ListPlusIcon,
  ListTodoIcon,
  TriangleAlertIcon,
  UserCheckIcon,
  UserPlusIcon,
  UsersIcon,
  UserXIcon,
  CalendarSearchIcon } from
'lucide-react';
import type {
  ActivityItem,
  AttendancePeriod,
  AttendanceSnapshot,
  DeadlineItem,
  ProjectSnapshot,
  QuickAction,
  SummaryStat,
  TaskStatusCount } from
'../types/dashboard';

export const summaryStats: SummaryStat[] = [
{ id: 'total', label: 'Total Employees', value: '120', icon: UsersIcon, tone: 'neutral', delta: '+4', trend: 'up', hint: 'joined this month' },
{ id: 'active', label: 'Active Employees', value: '112', icon: UserCheckIcon, tone: 'success', hint: '8 inactive or on extended leave' },
{ id: 'present', label: 'Present Today', value: '98', icon: CalendarCheckIcon, tone: 'primary', delta: '82%', trend: 'up', hint: 'attendance · 86 on time', featured: true },
{ id: 'late', label: 'Late Today', value: '12', icon: ClockIcon, tone: 'warning', delta: '+3', trend: 'up', positive: false, hint: 'vs yesterday' },
{ id: 'absent', label: 'Absent Today', value: '7', icon: UserXIcon, tone: 'danger', hint: '15 more on approved leave' },
{ id: 'projects', label: 'Active Projects', value: '12', icon: FolderKanbanIcon, tone: 'primary', hint: '3 at risk · 1 delayed' },
{ id: 'pending', label: 'Pending Tasks', value: '28', icon: ListTodoIcon, tone: 'neutral', hint: '3 blocked' },
{ id: 'overdue', label: 'Overdue Tasks', value: '4', icon: TriangleAlertIcon, tone: 'danger', delta: '−2', trend: 'down', positive: true, hint: 'vs last week' }];


export const attendanceByPeriod: Record<AttendancePeriod, AttendanceSnapshot> = {
  today: { label: 'Today', caption: '120 employees expected today', present: 86, late: 12, absent: 7, leave: 15, comparison: '+3% vs yesterday' },
  yesterday: { label: 'Yesterday', caption: '120 employees expected yesterday', present: 90, late: 9, absent: 6, leave: 15, comparison: '+1% vs the day before' },
  week: { label: 'This week', caption: 'Daily average, Mon – Fri', present: 88, late: 10, absent: 7, leave: 15, comparison: '+2% vs last week' },
  month: { label: 'This month', caption: 'Daily average, Sep 1 – 30', present: 87, late: 11, absent: 8, leave: 14, comparison: '−1% vs August' }
};

export const attendancePeriodOptions: {value: AttendancePeriod;label: string;}[] = [
{ value: 'today', label: 'Today' },
{ value: 'yesterday', label: 'Yesterday' },
{ value: 'week', label: 'This week' },
{ value: 'month', label: 'This month' }];


export const projectSnapshots: ProjectSnapshot[] = [
{ id: 'p1', name: 'Employee Management System', lead: 'Maria Santos', team: 'Engineering', progress: 72, status: 'On track', deadline: 'Nov 20, 2026', deadlineNote: 'in 47 days' },
{ id: 'p2', name: 'Inventory Management System', lead: 'Ana Garcia', team: 'Operations', progress: 45, status: 'At risk', deadline: 'Oct 30, 2026', deadlineNote: 'in 26 days' },
{ id: 'p3', name: 'Attendance System', lead: 'Pedro Reyes', team: 'HR Technology', progress: 88, status: 'On track', deadline: 'Oct 16, 2026', deadlineNote: 'in 12 days' },
{ id: 'p4', name: 'Company Website', lead: 'Carlo Mendoza', team: 'Marketing', progress: 30, status: 'Delayed', deadline: 'Oct 12, 2026', deadlineNote: 'in 8 days' }];


export const taskStatusCounts: TaskStatusCount[] = [
{ id: 'todo', label: 'To Do', count: 15 },
{ id: 'progress', label: 'In Progress', count: 10 },
{ id: 'completed', label: 'Completed', count: 41 },
{ id: 'blocked', label: 'Blocked', count: 3 },
{ id: 'overdue', label: 'Overdue', count: 4 }];


export const recentActivity: ActivityItem[] = [
{ id: 'a1', type: 'task', actor: 'Juan Dela Cruz', action: 'completed', target: 'Database Design', time: '8 min ago' },
{ id: 'a2', type: 'assignment', actor: 'Maria Santos', action: 'was assigned to', target: 'Employee Management System', time: '25 min ago' },
{ id: 'a3', type: 'attendance', actor: 'Pedro Reyes', action: 'clocked in at', target: '08:52', time: '1 h ago' },
{ id: 'a4', type: 'project', action: 'New project created:', target: 'Company Website', time: '2 h ago' },
{ id: 'a5', type: 'deadline', action: 'Task deadline approaching:', target: 'API Integration, due tomorrow', time: '3 h ago' },
{ id: 'a6', type: 'task', actor: 'Ana Garcia', action: 'completed', target: 'Stock Level Alerts', time: 'Yesterday' }];


export const upcomingDeadlines: DeadlineItem[] = [
{ id: 'd1', name: 'API Integration', kind: 'Task', project: 'Employee Management System', assignee: 'Juan Dela Cruz', due: 'Oct 5', dueIn: 'Tomorrow', priority: 'High', status: 'In progress' },
{ id: 'd2', name: 'Payroll Report Export', kind: 'Task', project: 'Attendance System', assignee: 'Pedro Reyes', due: 'Oct 6', dueIn: 'In 2 days', priority: 'Medium', status: 'To do' },
{ id: 'd3', name: 'Supplier Data Migration', kind: 'Task', project: 'Inventory Management System', assignee: 'Ana Garcia', due: 'Oct 7', dueIn: 'In 3 days', priority: 'Urgent', status: 'Blocked' },
{ id: 'd4', name: 'Homepage UI Design', kind: 'Task', project: 'Company Website', assignee: 'Liza Ramos', due: 'Oct 9', dueIn: 'In 5 days', priority: 'Medium', status: 'In review' },
{ id: 'd5', name: 'Company Website', kind: 'Project', assignee: 'Carlo Mendoza', due: 'Oct 12', dueIn: 'In 8 days', priority: 'High', status: 'In progress' },
{ id: 'd6', name: 'Attendance System', kind: 'Project', assignee: 'Pedro Reyes', due: 'Oct 16', dueIn: 'In 12 days', priority: 'Medium', status: 'In review' }];


export const quickActions: QuickAction[] = [
{ id: 'employee', label: 'Add Employee', description: 'Employees', path: '/employees', icon: UserPlusIcon },
{ id: 'project', label: 'Create Project', description: 'All Projects', path: '/projects', icon: FolderPlusIcon },
{ id: 'task', label: 'Create Task', description: 'Tasks', path: '/tasks', icon: ListPlusIcon },
{ id: 'attendance', label: 'View Attendance', description: 'Attendance', path: '/attendance', icon: CalendarSearchIcon },
{ id: 'report', label: 'Generate Report', description: 'Reports', path: '/reports', icon: FilePlus2Icon }];