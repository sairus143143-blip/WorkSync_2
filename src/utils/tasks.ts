import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import type { Employee } from '../types/employees';
import type { Position } from '../types/organization';
import type { Project, ProjectMember } from '../types/projects';
import type {
  ProjectTaskStats,
  Task,
  TaskActivityType,
  TaskDeadlineFilter,
  TaskFormErrors,
  TaskFormValues,
  TaskPriority,
  TaskRow,
  TaskSortKey,
  TaskStatus,
  TaskSummaryStats } from
'../types/tasks';
import { employeeFullName } from './employees';
import { findPosition } from './organization';
import { PROJECT_TODAY, DUE_SOON_DAYS, projectNowIso } from './projects';
import { formatConfiguredDate } from './settingsFormat';

export const TASK_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'in_review', 'completed', 'blocked'];
export const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'critical'];

export const taskStatusLabels: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  completed: 'Completed',
  blocked: 'Blocked'
};

export const taskPriorityLabels: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical'
};

export const DUPLICATE_TASK_CODE_MESSAGE = 'Task code already exists.';
export const PROJECT_MEMBER_REQUIRED_MESSAGE = 'Employee must belong to the selected project.';
export const CLOSED_PROJECT_TASK_MESSAGE = 'Tasks cannot be added to a completed or cancelled project.';

const priorityOrder: Record<TaskPriority, number> = { low: 0, medium: 1, high: 2, critical: 3 };
const statusOrder: Record<TaskStatus, number> = { todo: 0, in_progress: 1, in_review: 2, completed: 3, blocked: 4 };

export function formatTaskDate(isoDate: string, pattern = 'MMM d, yyyy'): string {
  return pattern === 'MMM d, yyyy' ? formatConfiguredDate(isoDate) : format(parseISO(isoDate), pattern);
}

export function taskNowIso(): string {
  return projectNowIso();
}

export function isTaskOverdue(task: Pick<Task, 'dueDate' | 'status'>, today = PROJECT_TODAY): boolean {
  if (task.status === 'completed' || task.status === 'blocked') return false;
  return differenceInCalendarDays(parseISO(task.dueDate), parseISO(today)) < 0;
}

export function isTaskDueToday(task: Pick<Task, 'dueDate' | 'status'>, today = PROJECT_TODAY): boolean {
  if (task.status === 'completed') return false;
  return task.dueDate === today;
}

export function isTaskDueSoon(task: Pick<Task, 'dueDate' | 'status'>, today = PROJECT_TODAY): boolean {
  if (task.status === 'completed' || isTaskOverdue(task, today) || isTaskDueToday(task, today)) return false;
  const days = differenceInCalendarDays(parseISO(task.dueDate), parseISO(today));
  return days > 0 && days <= DUE_SOON_DAYS;
}

export function summarizeTasks(tasks: Task[], today = PROJECT_TODAY): TaskSummaryStats {
  const stats: TaskSummaryStats = {
    total: tasks.length,
    todo: 0,
    in_progress: 0,
    in_review: 0,
    completed: 0,
    blocked: 0,
    overdue: 0
  };
  for (const t of tasks) {
    stats[t.status] += 1;
    if (isTaskOverdue(t, today)) stats.overdue += 1;
  }
  return stats;
}

export function summarizeProjectTasks(tasks: Task[], projectId: string, today = PROJECT_TODAY): ProjectTaskStats {
  return summarizeTasks(tasks.filter((t) => t.projectId === projectId), today);
}

export function activeMemberEmployeeIds(members: ProjectMember[], projectId: string): string[] {
  return members.filter((m) => m.projectId === projectId && m.status === 'active').map((m) => m.employeeId);
}

export function isEmployeeOnProject(members: ProjectMember[], projectId: string, employeeId: string): boolean {
  return members.some((m) => m.projectId === projectId && m.employeeId === employeeId && m.status === 'active');
}

export function projectAcceptsNewTasks(status: Project['status']): boolean {
  return status === 'planning' || status === 'active' || status === 'on_hold';
}

export function normalizeTaskProgress(status: TaskStatus, progress: number): {status: TaskStatus;progress: number;} {
  let p = Math.min(100, Math.max(0, progress));
  const s = status;
  if (s === 'completed') p = 100;
  return { status: s, progress: p };
}

export function nextTaskId(tasks: Task[]): string {
  const nums = tasks.map((t) => Number.parseInt(t.id.replace(/\D/g, ''), 10)).filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `TSK-${String(next).padStart(3, '0')}`;
}

export function nextTaskCode(tasks: Task[]): string {
  return nextTaskId(tasks);
}

interface ValidateCtx {
  tasks: Task[];
  projects: Project[];
  members: ProjectMember[];
  employees: Employee[];
  editing?: Task;
}

export function validateTaskForm(values: TaskFormValues, ctx: ValidateCtx): TaskFormErrors {
  const errors: TaskFormErrors = {};
  const title = values.title.trim();
  const code = values.taskCode.trim().toUpperCase();

  if (!title) errors.title = 'Task title is required.';
  if (!code) errors.taskCode = 'Task code is required.';
  else if (ctx.tasks.some((t) => t.taskCode.toUpperCase() === code && t.id !== ctx.editing?.id)) errors.taskCode = DUPLICATE_TASK_CODE_MESSAGE;

  if (!values.projectId) errors.projectId = 'Project is required.';
  else {
    const project = ctx.projects.find((p) => p.id === values.projectId);
    if (!project) errors.projectId = 'Project must exist.';
    else if (!ctx.editing && !projectAcceptsNewTasks(project.status)) errors.projectId = CLOSED_PROJECT_TASK_MESSAGE;
  }

  if (!values.assignedEmployeeId) errors.assignedEmployeeId = 'Assigned employee is required.';
  else if (values.projectId) {
    if (!ctx.employees.some((e) => e.id === values.assignedEmployeeId)) errors.assignedEmployeeId = 'Employee must exist.';
    else if (!isEmployeeOnProject(ctx.members, values.projectId, values.assignedEmployeeId)) errors.assignedEmployeeId = PROJECT_MEMBER_REQUIRED_MESSAGE;
  }

  if (!values.priority) errors.priority = 'Priority is required.';
  if (!values.status) errors.status = 'Status is required.';
  if (!values.startDate) errors.startDate = 'Start date is required.';
  if (!values.dueDate) errors.dueDate = 'Due date is required.';
  else if (values.startDate && values.dueDate < values.startDate) errors.dueDate = 'Due date cannot be before start date.';

  const progress = Number(values.progress);
  if (values.progress === '' || Number.isNaN(progress)) errors.progress = 'Progress is required.';
  else if (progress < 0 || progress > 100) errors.progress = 'Progress must be between 0 and 100.';
  else if (values.status === 'completed' && progress !== 100) errors.progress = 'Completed tasks must have 100% progress.';

  return errors;
}

export function buildTaskRow(
  task: Task,
  projects: Project[],
  employees: Employee[],
  positions: Position[],
  today = PROJECT_TODAY
): TaskRow | null {
  const project = projects.find((p) => p.id === task.projectId);
  const employee = employees.find((e) => e.id === task.assignedEmployeeId);
  if (!project || !employee) return null;
  return {
    task,
    project,
    employee,
    position: findPosition(positions, employee.positionId),
    employeeName: employeeFullName(employee),
    overdue: isTaskOverdue(task, today),
    dueToday: isTaskDueToday(task, today),
    dueSoon: isTaskDueSoon(task, today)
  };
}

export function buildTaskRows(
  tasks: Task[],
  projects: Project[],
  employees: Employee[],
  positions: Position[],
  today = PROJECT_TODAY
): TaskRow[] {
  return tasks.map((t) => buildTaskRow(t, projects, employees, positions, today)).filter((r): r is TaskRow => r !== null);
}

export function compareTaskRows(a: TaskRow, b: TaskRow, key: TaskSortKey): number {
  switch (key) {
    case 'title':
      return a.task.title.localeCompare(b.task.title);
    case 'project':
      return a.project.name.localeCompare(b.project.name);
    case 'employee':
      return a.employeeName.localeCompare(b.employeeName);
    case 'priority':
      return priorityOrder[a.task.priority] - priorityOrder[b.task.priority];
    case 'status':
      return statusOrder[a.task.status] - statusOrder[b.task.status];
    case 'startDate':
      return a.task.startDate.localeCompare(b.task.startDate);
    case 'dueDate':
      return a.task.dueDate.localeCompare(b.task.dueDate);
    case 'progress':
      return a.task.progress - b.task.progress;
  }
}

export function taskSearchText(row: TaskRow): string {
  return [row.task.title, row.task.taskCode, row.project.name, row.project.code, row.employeeName, row.employee.employeeNumber].join(' ');
}

export function matchesDeadlineFilter(row: TaskRow, filter: TaskDeadlineFilter, today = PROJECT_TODAY): boolean {
  if (filter === 'all') return true;
  if (filter === 'overdue') return row.overdue;
  if (filter === 'due_today') return row.dueToday;
  if (filter === 'due_week') {
    const days = differenceInCalendarDays(parseISO(row.task.dueDate), parseISO(today));
    return row.task.status !== 'completed' && days >= 0 && days <= 7;
  }
  if (filter === 'upcoming') {
    const days = differenceInCalendarDays(parseISO(row.task.dueDate), parseISO(today));
    return row.task.status !== 'completed' && days > 7;
  }
  return true;
}

export function employeeTaskCounts(tasks: Task[], employeeId: string, today = PROJECT_TODAY) {
  const mine = tasks.filter((t) => t.assignedEmployeeId === employeeId);
  return {
    active: mine.filter((t) => t.status !== 'completed').length,
    completed: mine.filter((t) => t.status === 'completed').length,
    overdue: mine.filter((t) => isTaskOverdue(t, today)).length
  };
}

export function activityDescription(type: TaskActivityType, detail: string): string {
  switch (type) {
    case 'created':
      return 'Task created.';
    case 'assigned':
      return detail || 'Task assigned.';
    case 'reassigned':
      return detail || 'Task reassigned.';
    case 'status_changed':
      return detail;
    case 'priority_changed':
      return detail;
    case 'progress_updated':
      return detail;
    case 'deadline_updated':
      return detail;
    default:
      return detail;
  }
}
