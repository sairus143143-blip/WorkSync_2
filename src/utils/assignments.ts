import { format, parseISO } from 'date-fns';
import type {
  AdminArea,
  AssignmentErrors,
  AssignmentInput,
  AssignmentRow,
  AssignmentRowStatus,
  PositionAdminAssignment } from
'../types/assignments';
import type { Department, Position } from '../types/organization';
import { findDepartment, findPosition } from './organization';

export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentRowStatus, string> = {
  assigned: 'Assigned',
  unassigned: 'Unassigned',
  inactive: 'Inactive'
};

export function findAdminArea(list: AdminArea[], id: string): AdminArea | undefined {
  return list.find((a) => a.id === id);
}

/** The single assignment record for a position (at most one exists). */
export function assignmentForPosition(list: PositionAdminAssignment[], positionId: string) {
  return list.find((a) => a.positionId === positionId);
}

/** One row per position, resolving every name from IDs. */
export function buildAssignmentRows(
positions: Position[],
departments: Department[],
adminAreas: AdminArea[],
assignments: PositionAdminAssignment[])
: AssignmentRow[] {
  return positions.map((position) => {
    const assignment = assignmentForPosition(assignments, position.id);
    return {
      position,
      department: findDepartment(departments, position.departmentId),
      assignment,
      adminArea: assignment ? findAdminArea(adminAreas, assignment.adminAreaId) : undefined,
      status: assignment ? assignment.status : 'unassigned',
      departmentMismatch: !!assignment && assignment.departmentId !== position.departmentId
    };
  });
}

/** Single source for the summary cards. */
export function summarizeAssignments(positions: Position[], assignments: PositionAdminAssignment[]) {
  const assignedPositions = positions.filter((p) => assignmentForPosition(assignments, p.id)?.status === 'assigned').length;
  return {
    totalPositions: positions.length,
    assignedPositions,
    unassignedPositions: positions.length - assignedPositions,
    activeAssignments: assignments.filter((a) => a.status === 'assigned').length,
    inactiveAssignments: assignments.filter((a) => a.status === 'inactive').length
  };
}

/** Suggests the area whose code matches the department code. Only a default — the admin can change it. */
export function suggestAdminArea(adminAreas: AdminArea[], department: Department | undefined): string {
  if (!department) return '';
  return adminAreas.find((a) => a.code.toUpperCase() === department.code.toUpperCase())?.id ?? '';
}

export function nextAssignmentId(list: PositionAdminAssignment[]): string {
  const max = list.reduce((highest, a) => Math.max(highest, Number(a.id.replace(/\D/g, '')) || 0), 0);
  return `ASSIGN-${String(max + 1).padStart(3, '0')}`;
}

export function formatUpdatedDate(iso: string): string {
  return format(parseISO(iso), 'MMMM d, yyyy');
}

export function formatUpdatedTime(iso: string): string {
  return format(parseISO(iso), 'h:mm a');
}

// ---------- Validation ----------

interface ValidationContext {
  positions: Position[];
  departments: Department[];
  adminAreas: AdminArea[];
  assignments: PositionAdminAssignment[];
  /** The record being edited, if any. */
  editing?: PositionAdminAssignment;
}

export function validateAssignment(input: AssignmentInput, ctx: ValidationContext): AssignmentErrors {
  const errors: AssignmentErrors = {};
  const position = findPosition(ctx.positions, input.positionId);
  const department = findDepartment(ctx.departments, input.departmentId);

  if (!input.positionId) errors.positionId = 'Please select a position.';else
  if (!position) errors.positionId = 'The selected position no longer exists.';else
  {
    const existing = assignmentForPosition(ctx.assignments, position.id);
    if (existing && existing.id !== ctx.editing?.id) errors.positionId = 'This position already has an assignment. Edit it instead.';else
    if (input.status === 'assigned' && position.status === 'inactive' && ctx.editing?.status !== 'assigned')
    errors.positionId = 'Inactive positions can’t receive an active responsibility. Reactivate it in Position Management first.';
  }

  if (!input.departmentId) errors.departmentId = 'The position has no department.';else
  if (!department) errors.departmentId = 'The position’s department no longer exists.';else
  if (position && position.departmentId !== department.id) errors.departmentId = 'Selected position does not belong to this department.';else
  if (input.status === 'assigned' && department.status === 'inactive' && ctx.editing?.status !== 'assigned')
  errors.departmentId = 'This position’s department is inactive. Reactivate it in Department Management first.';

  if (!input.adminAreaId) errors.adminAreaId = 'Please select an administrative area.';else
  if (!findAdminArea(ctx.adminAreas, input.adminAreaId)) errors.adminAreaId = 'The selected administrative area no longer exists.';

  if (!input.status) errors.status = 'Please select an assignment status.';
  return errors;
}