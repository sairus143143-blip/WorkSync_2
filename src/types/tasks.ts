import type { Employee } from './employees';
import type { Department, Position } from './organization';
import type { Project } from './projects';
import type { SortState } from './organization';

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'completed' | 'blocked';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export type TaskActivityType =
  | 'created'
  | 'assigned'
  | 'reassigned'
  | 'status_changed'
  | 'priority_changed'
  | 'progress_updated'
  | 'deadline_updated';

export interface Task {
  id: string;
  taskCode: string;
  projectId: string;
  title: string;
  description?: string;
  assignedEmployeeId: string;
  createdByUserId: string;
  startDate: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  progress: number;
  createdAt: string;
  completedAt?: string | null;
}

export interface TaskActivity {
  id: string;
  taskId: string;
  type: TaskActivityType;
  description: string;
  createdByUserId: string;
  createdAt: string;
}

export interface TaskFormValues {
  title: string;
  taskCode: string;
  projectId: string;
  description: string;
  assignedEmployeeId: string;
  priority: TaskPriority;
  status: TaskStatus;
  startDate: string;
  dueDate: string;
  progress: string;
}

export type TaskFormErrors = Partial<Record<keyof TaskFormValues, string>>;

export type TaskSortKey =
  | 'title'
  | 'project'
  | 'employee'
  | 'priority'
  | 'status'
  | 'startDate'
  | 'dueDate'
  | 'progress';

export type TaskStatusFilter = 'all' | TaskStatus;
export type TaskPriorityFilter = 'all' | TaskPriority;
export type TaskDeadlineFilter = 'all' | 'overdue' | 'due_today' | 'due_week' | 'upcoming';

export interface TaskRow {
  task: Task;
  project: Project;
  employee: Employee;
  department: Department | undefined;
  position: Position | undefined;
  employeeName: string;
  overdue: boolean;
  dueToday: boolean;
  dueSoon: boolean;
}

export type TaskSort = SortState<TaskSortKey>;

export interface TaskSummaryStats {
  total: number;
  todo: number;
  in_progress: number;
  in_review: number;
  completed: number;
  blocked: number;
  overdue: number;
}

export type ProjectTaskStats = TaskSummaryStats;
