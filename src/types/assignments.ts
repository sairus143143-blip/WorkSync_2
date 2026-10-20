import type { Department, Position } from './organization';

/**
 * An administrative responsibility area. NOT a user account — WorkSync has exactly one
 * system administrator, who controls every area.
 */
export interface AdminArea {
  id: string;
  name: string;
  code: string;
}

/** Stored lifecycle of an assignment record. Records are never deleted. */
export type AssignmentStatus = 'assigned' | 'inactive';

/** Display status of a position row: a position with no record is "unassigned". */
export type AssignmentRowStatus = AssignmentStatus | 'unassigned';

/** Position → administrative area link. Names are always resolved from IDs. */
export interface PositionAdminAssignment {
  id: string;
  positionId: string;
  departmentId: string;
  adminAreaId: string;
  status: AssignmentStatus;
  /** ISO date-time */
  updatedAt: string;
}

export interface AssignmentInput {
  positionId: string;
  departmentId: string;
  adminAreaId: string;
  status: AssignmentStatus | '';
}

export type AssignmentErrors = Partial<Record<keyof AssignmentInput, string>>;

/** One row per position, joined with its (optional) assignment for display. */
export interface AssignmentRow {
  position: Position;
  department?: Department;
  assignment?: PositionAdminAssignment;
  adminArea?: AdminArea;
  status: AssignmentRowStatus;
  /** True when the stored departmentId no longer matches the position's department. */
  departmentMismatch: boolean;
}

export type AssignmentSortKey = 'name' | 'code' | 'department' | 'area' | 'status' | 'updated';

export type AssignmentStatusFilter = 'all' | AssignmentRowStatus;