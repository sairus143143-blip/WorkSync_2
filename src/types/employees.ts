import type { Position } from './organization';
import type { SystemUser } from './users';

export type { Position } from './organization';

/** Workforce status — separate from the user account's access status. */
export type EmploymentStatus = 'active' | 'on_leave' | 'inactive';

/**
 * Workforce record. Account data (email, role, account status, last activity)
 * belongs to the linked SystemUser via userId. Position names are resolved through
 * positionId and never copied here.
 */
export interface Employee {
  id: string;
  userId: string;
  employeeNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  phone: string;
  address: string;
  positionId: string;
  /** ISO date */
  dateHired: string;
  employmentStatus: EmploymentStatus;
  avatar: string | null;
}

/** Read-only join of an employee with its account and position for display. */
export interface EmployeeView {
  employee: Employee;
  user?: SystemUser;
  position?: Position;
  fullName: string;
}

export interface EmployeeFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  middleName: string;
  lastName: string;
  phone: string;
  address: string;
  avatar: string | null;
  employeeNumber: string;
  positionId: string;
  dateHired: string;
  employmentStatus: EmploymentStatus | '';
}

export type EmployeeFormErrors = Partial<Record<keyof EmployeeFormValues, string>>;

export type EmployeeSortKey = 'name' | 'employeeNumber' | 'position' | 'dateHired' | 'status';

export interface EmployeeSort {
  key: EmployeeSortKey;
  direction: 'asc' | 'desc';
}

export type EmploymentStatusFilter = 'all' | EmploymentStatus;