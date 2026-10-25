import type { Employee } from '../types/employees';
import type { Position, PositionErrors, PositionInput } from '../types/organization';

export const recordStatusLabels = { active: 'Active', inactive: 'Inactive' } as const;

export function findPosition(list: Position[], id: string): Position | undefined {
  return list.find((position) => position.id === id);
}

export function positionStats(position: Position, employees: Employee[]) {
  const members = employees.filter((employee) => employee.positionId === position.id);
  return {
    employees: members.length,
    activeEmployees: members.filter((employee) => employee.employmentStatus !== 'inactive').length,
    inactiveEmployees: members.filter((employee) => employee.employmentStatus === 'inactive').length
  };
}

export function summarizePositions(positions: Position[], employees: Employee[]) {
  const filled = positions.filter((position) => employees.some((employee) => employee.positionId === position.id)).length;
  return {
    total: positions.length,
    active: positions.filter((position) => position.status === 'active').length,
    inactive: positions.filter((position) => position.status === 'inactive').length,
    assigned: filled,
    unassigned: positions.length - filled
  };
}

export function newPositionId(list: Position[], code: string): string {
  const taken = new Set(list.map((position) => position.id));
  const base = code.trim().toUpperCase();
  if (!taken.has(base)) return base;
  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

export function suggestPositionCode(positions: Position[]): string {
  const max = positions.reduce((highest, position) => {
    const match = /^POS-(\d+)$/i.exec(position.code);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  return `POS-${String(max + 1).padStart(3, '0')}`;
}

const CODE_PATTERN = /^[A-Z0-9-]+$/;

export function validatePosition(input: PositionInput, positions: Position[], editingId?: string): PositionErrors {
  const errors: PositionErrors = {};
  const name = input.name.trim().toLowerCase();
  const code = input.code.trim().toUpperCase();
  const others = positions.filter((position) => position.id !== editingId);
  if (!name) errors.name = 'Position name is required.';
  else if (others.some((position) => position.name.trim().toLowerCase() === name)) errors.name = 'Position name already exists.';

  if (!code) errors.code = 'Position code is required.';
  else if (!CODE_PATTERN.test(code)) errors.code = 'Use letters, numbers and hyphens only.';
  else if (others.some((position) => position.code.toUpperCase() === code)) errors.code = 'Position code already exists.';

  if (!input.description.trim()) errors.description = 'Description is required.';
  if (!input.status) errors.status = 'Please select a status.';
  return errors;
}
