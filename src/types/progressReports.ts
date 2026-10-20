import type { TaskStatus } from './tasks';

export type ProgressReportStatus = 'submitted' | 'reviewed' | 'needs_revision';
export type ProgressReviewAction = 'reviewed' | 'revision_requested';

export interface ProgressReportVersion {
  id: string;
  summary: string;
  progress: number;
  taskStatus: TaskStatus;
  submittedAt: string;
}

export interface ProgressReportReviewEvent {
  id: string;
  versionId: string;
  action: ProgressReviewAction;
  feedback: string;
  reviewerUserId: string;
  reviewerName: string;
  createdAt: string;
}

export interface ProgressReport {
  id: string;
  taskId: string;
  taskCode: string;
  taskTitle: string;
  employeeId: string;
  employeeName: string;
  periodStart: string;
  periodEnd: string;
  status: ProgressReportStatus;
  versions: ProgressReportVersion[];
  reviewEvents: ProgressReportReviewEvent[];
}

export interface TaskReportPeriod {
  id: string;
  taskId: string;
  startDate: string;
  endDate: string;
  dueDate: string;
}