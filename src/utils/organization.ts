import type { Employee } from '../types/employees';
import type {
  Department,
  DepartmentErrors,
  DepartmentInput,
  Position,
  PositionErrors,
  PositionInput,
  RecordStatus } from
'../types/organization';

export const recordStatusLabels: Record<RecordStatus, string> = { active: 'Active', inactive: 'Inactive' };

const CODE_PATTERN = /^[A-Z0-9-]+$/;

// ---------- Lookups ----------

export function findDepartment(list: Department[], id: string): Department | undefined {
  return list.find((d) => d.id === id);
}

export function findPosition(list: Position[], id: string): Position | undefined {
  return list.find((p) => p.id === id);
}

export function positionsInDepartment(list: Position[], departmentId: string): Position[] {
  return list.filter((p) => p.departmentId === departmentId);
}

// ---------- Derived counts (never stored) ----------

export function departmentStats(department: Department, positions: Position[], employees: Employee[]) {
  const members = employees.filter((e) => e.departmentId === department.id);
  return {
    employees: members.length,
    activeEmployees: members.filter((e) => e.employmentStatus !== 'inactive').length,
    inactiveEmployees: members.filter((e) => e.employmentStatus === 'inactive').length,
    positions: positionsInDepartment(positions, department.id).length
  };
}

export function positionStats(position: Position, employees: Employee[]) {
  const members = employees.filter((e) => e.positionId === position.id);
  return {
    employees: members.length,
    activeEmployees: members.filter((e) => e.employmentStatus !== 'inactive').length,
    inactiveEmployees: members.filter((e) => e.employmentStatus === 'inactive').length
  };
}

export function summarizeDepartments(departments: Department[], employees: Employee[]) {
  return {
    total: departments.length,
    active: departments.filter((d) => d.status === 'active').length,
    inactive: departments.filter((d) => d.status === 'inactive').length,
    employees: employees.filter((e) => departments.some((d) => d.id === e.departmentId)).length
  };
}

export function summarizePositions(positions: Position[], employees: Employee[]) {
  const filled = positions.filter((p) => employees.some((e) => e.positionId === p.id)).length;
  return {
    total: positions.length,
    active: positions.filter((p) => p.status === 'active').length,
    inactive: positions.filter((p) => p.status === 'inactive').length,
    assigned: filled,
    unassigned: positions.length - filled
  };
}

// ---------- IDs & codes ----------

function uniqueId(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

export function newDepartmentId(list: Department[], code: string): string {
  return uniqueId(`DEPT-${code.trim().toUpperCase()}`, new Set(list.map((d) => d.id)));
}

export function newPositionId(list: Position[], code: string): string {
  return uniqueId(code.trim().toUpperCase(), new Set(list.map((p) => p.id)));
}

/** Suggests the next position code for a department, e.g. POS-IT-005. */
export function suggestPositionCode(positions: Position[], department: Department | undefined): string {
  if (!department) return '';
  const prefix = `POS-${department.code}-`;
  const max = positions.
  filter((p) => p.code.startsWith(prefix)).
  reduce((highest, p) => Math.max(highest, Number(p.code.slice(prefix.length)) || 0), 0);
  return `${prefix}${String(max + 1).padStart(3, '0')}`;
}

// ---------- Validation ----------

export function validateDepartment(input: DepartmentInput, list: Department[], editingId?: string): DepartmentErrors {
  const errors: DepartmentErrors = {};
  const name = input.name.trim().toLowerCase();
  const code = input.code.trim().toUpperCase();
  const others = list.filter((d) => d.id !== editingId);

  if (!name) errors.name = 'Department name is required.';else
  if (others.some((d) => d.name.trim().toLowerCase() === name)) errors.name = 'Department name already exists.';

  if (!code) errors.code = 'Department code is required.';else
  if (!CODE_PATTERN.test(code)) errors.code = 'Use letters, numbers and hyphens only.';else
  if (others.some((d) => d.code.toUpperCase() === code)) errors.code = 'Department code already exists.';

  if (!input.description.trim()) errors.description = 'Description is required.';
  if (!input.status) errors.status = 'Please select a status.';
  return errors;
}

export function validatePosition(
input: PositionInput,
positions: Position[],
departments: Department[],
editing?: Position,
/** Employees currently holding the position being edited. */
assignedEmployees = 0)
: PositionErrors {
  const errors: PositionErrors = {};
  const name = input.name.trim().toLowerCase();
  const code = input.code.trim().toUpperCase();
  const others = positions.filter((p) => p.id !== editing?.id);
  const department = findDepartment(departments, input.departmentId);

  if (!name) errors.name = 'Position name is required.';else
  if (department && others.some((p) => p.departmentId === department.id && p.name.trim().toLowerCase() === name))
  errors.name = `A position with this name already exists in ${department.name}.`;

  if (!code) errors.code = 'Position code is required.';else
  if (!CODE_PATTERN.test(code)) errors.code = 'Use letters, numbers and hyphens only.';else
  if (others.some((p) => p.code.toUpperCase() === code)) errors.code = 'Position code already exists.';

  if (!input.departmentId) errors.departmentId = 'Please select a department.';else
  if (!department) errors.departmentId = 'The selected department no longer exists.';else
  if (department.status === 'inactive' && department.id !== editing?.departmentId)
  errors.departmentId = 'Inactive departments cannot receive new positions.';else
  if (editing && department.id !== editing.departmentId && assignedEmployees > 0)
    // An employee's position must always belong to the employee's department.
    errors.departmentId = `${assignedEmployees} ${assignedEmployees === 1 ? 'employee holds' : 'employees hold'} this position. Reassign them in Employee Management before moving it to another department.`;

  if (!input.description.trim()) errors.description = 'Description is required.';
  if (!input.status) errors.status = 'Please select a status.';
  return errors;
}