import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { workSchedule } from '../data/attendanceSchedule';
import type { Employee } from '../types/employees';
import type {
  DeadlineState,
  Project,
  ProjectActivity,
  ProjectFormErrors,
  ProjectFormValues,
  ProjectMember,
  ProjectRow,
  ProjectStatus,
  ProgressFilter } from
'../types/projects';

/** The prototype's "today" — shared with Attendance so mock dates line up. */
export const PROJECT_TODAY = workSchedule.today;

/** Days remaining at or below which a deadline counts as "Due Soon". */
export const DUE_SOON_DAYS = 7;

export const PROJECT_STATUSES: ProjectStatus[] = ['planning', 'active', 'on_hold', 'completed', 'cancelled'];

export const projectStatusLabels: Record<ProjectStatus, string> = {
  planning: 'Planning',
  active: 'Active',
  on_hold: 'On Hold',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

export const deadlineStateLabels: Record<DeadlineState, string> = {
  upcoming: 'Upcoming',
  due_soon: 'Due Soon',
  overdue: 'Overdue',
  completed: 'Completed',
  cancelled: 'Not applicable'
};

export const progressFilterLabels: Record<ProgressFilter, string> = {
  all: 'All Progress',
  '0-25': '0–25%',
  '26-50': '26–50%',
  '51-75': '51–75%',
  '76-99': '76–99%',
  '100': '100%'
};

// ---------- Dates ----------

export function formatProjectDate(isoDate: string, pattern = 'MMMM d, yyyy'): string {
  return format(parseISO(isoDate), pattern);
}

export function formatActivityTime(iso: string): string {
  return format(parseISO(iso), 'MMM d, yyyy · h:mm a');
}

/** Timestamp on the prototype's anchored "today" with the current clock time. */
export function projectNowIso(): string {
  return `${PROJECT_TODAY}T${format(new Date(), 'HH:mm:ss')}`;
}

export function daysUntil(deadline: string, today = PROJECT_TODAY): number {
  return differenceInCalendarDays(parseISO(deadline), parseISO(today));
}

export function deadlineState(project: Pick<Project, 'deadline' | 'status'>, today = PROJECT_TODAY): DeadlineState {
  if (project.status === 'completed') return 'completed';
  if (project.status === 'cancelled') return 'cancelled';
  const days = daysUntil(project.deadline, today);
  if (days < 0) return 'overdue';
  return days <= DUE_SOON_DAYS ? 'due_soon' : 'upcoming';
}

export function daysRemainingLabel(days: number): string {
  if (days === 0) return 'Due today';
  if (days < 0) return `${Math.abs(days)} ${Math.abs(days) === 1 ? 'day' : 'days'} overdue`;
  return `${days} ${days === 1 ? 'day' : 'days'} remaining`;
}

// ---------- Relationships (derived, never stored) ----------

export function latestActivities(activities: ProjectActivity[], limit: number, projectId?: string): ProjectActivity[] {
  return activities.
  filter((a) => !projectId || a.projectId === projectId).
  sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id)).
  slice(0, limit);
}

export function activeMembersOf(members: ProjectMember[], projectId: string): ProjectMember[] {
  return members.filter((m) => m.projectId === projectId && m.status === 'active');
}

export function memberSummary(members: ProjectMember[], employees: Employee[], projectId: string) {
  const team = activeMembersOf(members, projectId).
  map((m) => employees.find((e) => e.id === m.employeeId)).
  filter((e): e is Employee => Boolean(e));
  return {
    teamMembers: team.length,
    activeMembers: team.filter((e) => e.employmentStatus === 'active').length
  };
}

export function buildProjectRows(projects: Project[], members: ProjectMember[]): ProjectRow[] {
  return projects.map((project) => ({
    project,
    memberCount: activeMembersOf(members, project.id).length,
    deadlineState: deadlineState(project),
    daysRemaining: daysUntil(project.deadline)
  }));
}

/** Single source for the summary cards and the overview. */
export function summarizeProjects(projects: Project[]) {
  const states = projects.map((p) => deadlineState(p));
  const byStatus = Object.fromEntries(PROJECT_STATUSES.map((s) => [s, 0])) as Record<ProjectStatus, number>;
  for (const p of projects) byStatus[p.status] += 1;
  return {
    total: projects.length,
    byStatus,
    active: byStatus.active,
    completed: byStatus.completed,
    dueSoon: states.filter((s) => s === 'due_soon').length,
    overdue: states.filter((s) => s === 'overdue').length
  };
}

export function matchesProgress(progress: number, filter: ProgressFilter): boolean {
  switch (filter) {
    case 'all':
      return true;
    case '0-25':
      return progress <= 25;
    case '26-50':
      return progress >= 26 && progress <= 50;
    case '51-75':
      return progress >= 51 && progress <= 75;
    case '76-99':
      return progress >= 76 && progress <= 99;
    case '100':
      return progress === 100;
  }
}

// ---------- Codes ----------

export function nextProjectCode(projects: Project[]): string {
  const max = projects.reduce((highest, p) => {
    const match = /^PRJ-(\d+)$/i.exec(p.code);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  return `PRJ-${String(max + 1).padStart(3, '0')}`;
}

export function nextProjectId(projects: Project[]): string {
  const taken = new Set(projects.map((p) => p.id));
  let n = projects.length + 1;
  while (taken.has(`PRJ-${String(n).padStart(3, '0')}`)) n += 1;
  return `PRJ-${String(n).padStart(3, '0')}`;
}

// ---------- Validation ----------

const CODE_PATTERN = /^[A-Z0-9-]+$/;
export const DUPLICATE_CODE_MESSAGE = 'Project code already exists.';

export function validateProject(
values: ProjectFormValues,
ctx: {projects: Project[];editing?: Project;})
: ProjectFormErrors {
  const errors: ProjectFormErrors = {};
  const code = values.code.trim().toUpperCase();

  if (!values.name.trim()) errors.name = 'Project name is required.';

  if (!code) errors.code = 'Project code is required.';else
  if (!CODE_PATTERN.test(code)) errors.code = 'Use letters, numbers and hyphens only, e.g. PRJ-014.';else
  if (ctx.projects.some((p) => p.code.toUpperCase() === code && p.id !== ctx.editing?.id)) errors.code = DUPLICATE_CODE_MESSAGE;

  if (!values.startDate) errors.startDate = 'Start date is required.';
  if (!values.deadline) errors.deadline = 'Deadline is required.';else
  if (values.startDate && values.deadline < values.startDate) errors.deadline = 'Deadline cannot be earlier than the start date.';

  if (!values.status) errors.status = 'Please select a status.';

  const progress = Number(values.progress);
  if (values.progress.trim() === '' || !Number.isFinite(progress)) errors.progress = 'Progress is required.';else
  if (!Number.isInteger(progress) || progress < 0 || progress > 100) errors.progress = 'Enter a whole number from 0 to 100.';

  return errors;
}