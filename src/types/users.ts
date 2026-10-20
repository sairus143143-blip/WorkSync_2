/**
 * WorkSync has exactly two roles and exactly ONE admin account.
 * admin    = the single, protected system administrator
 * employee = a standard workforce user account
 */
export type UserRole = 'admin' | 'employee';
export type AccountStatus = 'active' | 'inactive';

/** A login account: identity, role and access. Workforce details live in the Employee record. */
export interface SystemUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  /** ISO date, e.g. 2026-09-01 */
  createdAt: string;
  /** ISO date-time, or null if the user has never signed in */
  lastActivity: string | null;
  avatarUrl?: string;
  /** PROTOTYPE ONLY — mock password kept in memory. Never store plain passwords in a real system. */
  mockPassword?: string;
}

/** Everything the admin can set on an employee account. Role is intentionally absent. */
export interface EmployeeAccountInput {
  firstName: string;
  lastName: string;
  email: string;
  status: AccountStatus;
  avatarUrl?: string;
  mockPassword?: string;
}

export type EmployeeAccountErrors = Partial<Record<keyof EmployeeAccountInput, string>>;

export type UserSortKey = 'name' | 'createdAt' | 'lastActivity' | 'status';

export interface UserSort {
  key: UserSortKey;
  direction: 'asc' | 'desc';
}

export type RoleFilter = 'all' | UserRole;
export type StatusFilter = 'all' | AccountStatus;