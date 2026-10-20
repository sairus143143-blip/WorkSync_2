import {
  BellIcon,
  BriefcaseIcon,
  Building2Icon,
  CalendarCheckIcon,
  FileTextIcon,
  FolderOpenIcon,
  GaugeIcon,
  ListChecksIcon,
  SettingsIcon,
  ShieldCheckIcon,
  UserCogIcon,
  UserIcon,
  UsersRoundIcon } from
'lucide-react';
import type { ModuleInfo } from '../types/modules';

export const modules = {
  users: {
    title: 'User Management',
    description: 'Manage WorkSync accounts, roles and access.',
    icon: UserCogIcon,
    capabilities: [
    'Create, edit and deactivate user accounts',
    'Assign Administrator, Manager and Employee roles',
    'Reset passwords and manage sign-in access',
    'Review recent account activity']

  },
  employees: {
    title: 'Employees',
    description: 'The central directory of everyone in the organization.',
    icon: UsersRoundIcon,
    capabilities: [
    'Searchable employee directory with filters',
    'Employee profiles with job and contact details',
    'Add, edit and archive employee records',
    'Link employees to departments and positions']

  },
  departments: {
    title: 'Departments',
    description: 'Organize the company into departments and teams.',
    icon: Building2Icon,
    capabilities: [
    'Create and organize departments',
    'Assign a head to each department',
    'See headcount per department',
    'View the projects each department runs']

  },
  positions: {
    title: 'Positions',
    description: 'Define the job titles and levels used across WorkSync.',
    icon: BriefcaseIcon,
    capabilities: [
    'Define job titles and seniority levels',
    'Map positions to departments',
    'Track filled and open seats',
    'Write position descriptions']

  },
  positionAdminAssignment: {
    title: 'Position Admin Assignment',
    description: 'Administrator assignment management will be implemented in Phase 7.',
    icon: ShieldCheckIcon,
    capabilities: [
    'Map administrative responsibilities to positions',
    'Review responsibility assignments by department',
    'Use imported organizational data when available',
    'Keep a history of assignment changes']

  },
  attendance: {
    title: 'Attendance',
    description: 'Daily check-ins, lateness, absences and leave.',
    icon: CalendarCheckIcon,
    capabilities: [
    'Daily check-in and check-out records',
    'Late, absent and on-leave tracking',
    'Attendance history for every employee',
    'Work schedules and grace-period rules']

  },
  projects: {
    title: 'All Projects',
    description: 'Every project running across the organization.',
    icon: FolderOpenIcon,
    capabilities: [
    'Create projects with owners and deadlines',
    'Add members from any department',
    'Track progress and project status',
    'Flag projects that are at risk']

  },
  tasks: {
    title: 'Tasks',
    description: 'The work inside each project, assigned to people.',
    icon: ListChecksIcon,
    capabilities: [
    'Create and assign tasks within projects',
    'Priorities, due dates and statuses',
    'List and board views',
    'Track overdue work']

  },
  productivity: {
    title: 'Productivity',
    description: 'How individuals, teams and departments are performing.',
    icon: GaugeIcon,
    capabilities: [
    'Productivity scores per employee and team',
    'Hours logged against targets',
    'Task completion and on-time rates',
    'Department-to-department comparisons']

  },
  reports: {
    title: 'Reports',
    description: 'Summaries of attendance, projects and productivity.',
    icon: FileTextIcon,
    capabilities: [
    'Monthly attendance summaries',
    'Project and task status reports',
    'Productivity reports by team',
    'Export to PDF and spreadsheet']

  },
  notifications: {
    title: 'Notifications',
    description: 'Every alert and update sent to you in one place.',
    icon: BellIcon,
    capabilities: [
    'Inbox of all notifications',
    'Read and unread filtering',
    'Alerts for late check-ins and at-risk projects',
    'Per-type notification preferences']

  },
  settings: {
    title: 'Settings',
    description: 'Organization-wide preferences and account settings.',
    icon: SettingsIcon,
    capabilities: [
    'Organization profile and branding',
    'Working hours and grace periods',
    'Notification defaults',
    'Security and access policies']

  },
  profile: {
    title: 'Profile',
    description: 'Your personal details and preferences.',
    icon: UserIcon,
    capabilities: [
    'Personal details and profile photo',
    'Contact information',
    'Password and security',
    'Personal notification preferences']

  }
} satisfies Record<string, ModuleInfo>;