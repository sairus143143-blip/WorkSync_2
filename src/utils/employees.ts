import { differenceInCalendarDays, parseISO } from 'date-fns';
import type { Employee, EmployeeFormErrors, EmployeeFormValues, EmployeeView, EmploymentStatus } from '../types/employees';
import type { Department, Position } from '../types/organization';
import type { SystemUser } from '../types/users';
import { findDepartment, findPosition } from './organization';
import { formatConfiguredDate } from './settingsFormat';
import { SYSTEM_ADMIN_EMAIL } from './users';

export const employmentStatusLabels: Record<EmploymentStatus, string> = {
  active: 'Active',
  on_leave: 'On Leave',
  inactive: 'Inactive'
};

/** Employees hired within this many days count as new hires. */
export const NEW_HIRE_WINDOW_DAYS = 90;

export function employeeFullName(e: Pick<Employee, 'firstName' | 'middleName' | 'lastName'>, withMiddle = false): string {
  return [e.firstName, withMiddle ? e.middleName : '', e.lastName].filter(Boolean).join(' ');
}

/** Joins employee records with their account, department and position. No data is copied into the record. */
export function buildEmployeeViews(
list: Employee[],
users: SystemUser[],
departments: Department[],
positions: Position[])
: EmployeeView[] {
  return list.map((employee) => ({
    employee,
    user: users.find((u) => u.id === employee.userId),
    department: findDepartment(departments, employee.departmentId),
    position: findPosition(positions, employee.positionId),
    fullName: employeeFullName(employee)
  }));
}

/**
 * Departments selectable in the employee form: active ones, plus the employee's
 * current (historical) department when editing, even if it is now inactive.
 */
export function assignableDepartments(departments: Department[], currentId?: string): Department[] {
  return departments.filter((d) => d.status === 'active' || d.id === currentId);
}

/** Active positions in the department, plus the employee's current position when it belongs there. */
export function assignablePositions(positions: Position[], departments: Department[], departmentId: string, currentId?: string): Position[] {
  if (!departmentId) return [];
  const department = findDepartment(departments, departmentId);
  return positions.filter(
    (p) =>
    p.departmentId === departmentId && (
    p.id === currentId || p.status === 'active' && department?.status === 'active')
  );
}

export function summarizeEmployees(list: Employee[], now: Date = new Date()) {
  return {
    total: list.length,
    active: list.filter((e) => e.employmentStatus === 'active').length,
    inactive: list.filter((e) => e.employmentStatus === 'inactive').length,
    onLeave: list.filter((e) => e.employmentStatus === 'on_leave').length,
    newHires: list.filter((e) => {
      const days = differenceInCalendarDays(now, parseISO(e.dateHired));
      return days >= 0 && days <= NEW_HIRE_WINDOW_DAYS;
    }).length
  };
}

export function nextEmployeeNumber(list: Employee[], now: Date = new Date()): string {
  const prefix = `EMP-${now.getFullYear()}-`;
  const max = list.
  filter((e) => e.employeeNumber.startsWith(prefix)).
  reduce((highest, e) => Math.max(highest, Number(e.employeeNumber.slice(prefix.length)) || 0), 0);
  return `${prefix}${String(max + 1).padStart(3, '0')}`;
}

export function nextEmployeeId(list: Employee[]): string {
  const max = list.reduce((highest, e) => Math.max(highest, Number(e.id.replace(/\D/g, '')) || 0), 0);
  return `EMP-${String(max + 1).padStart(3, '0')}`;
}

export function formatDateHired(isoDate: string): string {
  return formatConfiguredDate(isoDate);
}

// ---------- Validation ----------

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+\d][\d\s-]{6,}$/;

export interface EmployeeValidationContext {
  employees: Employee[];
  users: SystemUser[];
  departments: Department[];
  positions: Position[];
  /** Present when editing — the record's original values. */
  editing?: Employee;
}

export function validateEmployeeForm(values: EmployeeFormValues, ctx: EmployeeValidationContext): EmployeeFormErrors {
  const errors: EmployeeFormErrors = {};
  const { editing } = ctx;
  const email = values.email.trim().toLowerCase();
  const number = values.employeeNumber.trim().toUpperCase();

  if (!email) errors.email = 'Email is required.';else
  if (!EMAIL_PATTERN.test(email)) errors.email = 'Please enter a valid email address.';else
  if (email === SYSTEM_ADMIN_EMAIL) errors.email = 'This email is reserved for the system administrator.';else
  if (ctx.users.some((u) => u.email.toLowerCase() === email && u.id !== editing?.userId))
  errors.email = 'An account with this email already exists.';

  if (!editing) {
    if (!values.password) errors.password = 'Password is required.';else
    if (values.password.length < 8) errors.password = 'Password must be at least 8 characters.';
    if (!values.confirmPassword) errors.confirmPassword = 'Please confirm the password.';else
    if (values.password !== values.confirmPassword) errors.confirmPassword = 'Passwords do not match.';
  }

  if (!values.firstName.trim()) errors.firstName = 'First name is required.';
  if (!values.lastName.trim()) errors.lastName = 'Last name is required.';
  if (values.phone.trim() && !PHONE_PATTERN.test(values.phone.trim())) errors.phone = 'Please enter a valid phone number.';

  if (!number) errors.employeeNumber = 'Employee number is required.';else
  if (ctx.employees.some((e) => e.employeeNumber.toUpperCase() === number && e.id !== editing?.id))
  errors.employeeNumber = 'Employee number already exists.';

  const department = findDepartment(ctx.departments, values.departmentId);
  if (!values.departmentId) errors.departmentId = 'Please select a department.';else
  if (!department) errors.departmentId = 'The selected department no longer exists.';else
  if (department.status === 'inactive' && department.id !== editing?.departmentId)
  errors.departmentId = 'Inactive departments cannot be used for new assignments.';

  const position = findPosition(ctx.positions, values.positionId);
  if (!values.positionId) errors.positionId = 'Please select a position.';else
  if (!position) errors.positionId = 'The selected position no longer exists.';else
  if (position.departmentId !== values.departmentId) errors.positionId = 'This position belongs to a different department.';else
  if (position.status === 'inactive' && position.id !== editing?.positionId)
  errors.positionId = 'Inactive positions cannot be used for new assignments.';

  if (!values.dateHired) errors.dateHired = 'Date hired is required.';
  if (!values.employmentStatus) errors.employmentStatus = 'Please select an employment status.';

  return errors;
}
