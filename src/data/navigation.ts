import {
  BellIcon,
  BriefcaseIcon,
  Building2Icon,
  CalendarCheckIcon,
  ClipboardListIcon,
  FileTextIcon,
  HardDriveDownloadIcon,
  FolderKanbanIcon,
  FolderOpenIcon,
  GaugeIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  NetworkIcon,
  SettingsIcon,
  ShieldCheckIcon,
  UserCogIcon,
  UserIcon,
  UsersRoundIcon } from
'lucide-react';
import type { NavEntry, RouteMeta } from '../types/navigation';

export const navigation: NavEntry[] = [
{ label: 'Dashboard', path: '/dashboard', icon: LayoutDashboardIcon },
{ label: 'User Management', path: '/users', icon: UserCogIcon, roles: ['admin'] },
{
  label: 'Workforce',
  icon: NetworkIcon,
  children: [
  { label: 'Employees', path: '/employees', icon: UsersRoundIcon, roles: ['admin'] },
  { label: 'Departments', path: '/departments', icon: Building2Icon, roles: ['admin'] },
  { label: 'Positions', path: '/positions', icon: BriefcaseIcon, roles: ['admin'] },
  { label: 'Position Admin Assignment', path: '/position-admin-assignment', icon: ShieldCheckIcon, roles: ['admin'] }]

},
{ label: 'Attendance', path: '/attendance', icon: CalendarCheckIcon, roles: ['admin'] },
{
  label: 'Projects',
  icon: FolderKanbanIcon,
  children: [
  { label: 'All Projects', path: '/projects', icon: FolderOpenIcon, roles: ['admin'] },
  { label: 'Tasks', path: '/tasks', icon: ListChecksIcon, roles: ['admin'] },
  { label: 'My Tasks', path: '/my-tasks', icon: ListChecksIcon, roles: ['employee'] }]

},
{ label: 'Productivity', path: '/productivity', icon: GaugeIcon, roles: ['admin'] },
{ label: 'Reports', path: '/reports', icon: FileTextIcon, roles: ['admin'] },
{ label: 'Weekly Report Review', path: '/weekly-reports', icon: FileTextIcon, roles: ['admin'] },
{ label: 'My Weekly Reports', path: '/my-reports', icon: FileTextIcon, roles: ['employee'] },
{ label: 'Notifications', path: '/notifications', icon: BellIcon, showUnread: true },
{ label: 'Activity Logs', path: '/activity-logs', icon: ClipboardListIcon, roles: ['admin'] },
{ label: 'System Settings', path: '/settings', icon: SettingsIcon, roles: ['admin'] }];
navigation.push({ label: 'Data Management', path: '/data-management', icon: HardDriveDownloadIcon, roles: ['admin'] });


/** Routes reachable from menus but not listed in the sidebar. */
export const secondaryRoutes: RouteMeta[] = [{ path: '/profile', title: 'Profile', icon: UserIcon }];
