import type { Department } from './organization';

/** Lifecycle status set by the admin. "Overdue" is a deadline condition, never a status. */
export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';

/**
 * A project controlled by the single system administrator. Department and creator are
 * referenced by ID and resolved for display. Progress is managed manually until tasks exist.
 */
export interface Project {
  id: string;
  name: string;
  code: string;
  description: string;
  departmentId: string;
  /** ISO date, yyyy-MM-dd */
  startDate: string;
  /** ISO date, yyyy-MM-dd */
  deadline: string;
  status: ProjectStatus;
  /** 0–100 */
  progress: number;
  /** User ID — always the system administrator. */
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectMemberStatus = 'active' | 'removed';

/** Project ↔ employee relationship. Names are resolved from employees/departments/positions. */
export interface ProjectMember {
  id: string;
  projectId: string;
  employeeId: string;
  assignedAt: string;
  status: ProjectMemberStatus;
}

export type ProjectActivityAction =
'project_created' |
'project_updated' |
'status_changed' |
'progress_updated' |
'member_added' |
'member_removed';

export interface ProjectActivity {
  id: string;
  projectId: string;
  action: ProjectActivityAction;
  description: string;
  /** User ID of the actor — always the system administrator. */
  performedBy: string;
  createdAt: string;
}

/** Deadline condition derived from deadline + status + today. */
export type DeadlineState = 'upcoming' | 'due_soon' | 'overdue' | 'completed' | 'cancelled';

export interface ProjectRow {
  project: Project;
  department?: Department;
  memberCount: number;
  deadlineState: DeadlineState;
  /** Negative when overdue. */
  daysRemaining: number;
}

export interface ProjectFormValues {
  name: string;
  code: string;
  description: string;
  departmentId: string;
  startDate: string;
  deadline: string;
  status: ProjectStatus | '';
  progress: string;
}

export type ProjectFormErrors = Partial<Record<keyof ProjectFormValues, string>>;

export type ProjectSortKey = 'name' | 'code' | 'department' | 'startDate' | 'deadline' | 'progress' | 'status' | 'members';

export type ProjectStatusFilter = 'all' | ProjectStatus;
export type DeadlineFilter = 'all' | 'upcoming' | 'due_soon' | 'overdue' | 'completed';
export type ProgressFilter = 'all' | '0-25' | '26-50' | '51-75' | '76-99' | '100';