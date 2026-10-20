import { format, isToday, isYesterday, parseISO } from 'date-fns';
import type {
  AccountStatus,
  EmployeeAccountErrors,
  EmployeeAccountInput,
  SystemUser,
  UserRole } from
'../types/users';

export const SYSTEM_ADMIN_EMAIL = 'admin@worksync.test';

export const roleLabels: Record<UserRole, string> = { admin: 'Administrator', employee: 'Employee' };
export const roleDescriptions: Record<UserRole, string> = {
  admin: 'System Administrator',
  employee: 'Regular Workforce User'
};
export const statusLabels: Record<AccountStatus, string> = { active: 'Active', inactive: 'Inactive' };

export const PROTECTED_ACCOUNT_MESSAGE =
'The WorkSync system administrator is a protected account and cannot be modified or deactivated.';

// ---------- Role rules ----------

/** The single protected system administrator. */
export function isSystemAdmin(user: Pick<SystemUser, 'role'>): boolean {
  return user.role === 'admin';
}

/** Only employee accounts can be edited, activated or deactivated. */
export function canModifyUser(user: Pick<SystemUser, 'role'>): boolean {
  return !isSystemAdmin(user);
}

export function displayName(user: Pick<SystemUser, 'firstName' | 'lastName' | 'role'>): string {
  return isSystemAdmin(user) ? `${user.firstName} - ${user.lastName}` : `${user.firstName} ${user.lastName}`;
}

export function summarizeUsers(list: SystemUser[]) {
  return {
    total: list.length,
    active: list.filter((u) => u.status === 'active').length,
    inactive: list.filter((u) => u.status === 'inactive').length,
    employees: list.filter((u) => u.role === 'employee').length,
    administrators: list.filter((u) => u.role === 'admin').length
  };
}

export function nextUserId(list: SystemUser[]): string {
  const max = list.reduce((highest, u) => Math.max(highest, Number(u.id.replace(/\D/g, '')) || 0), 0);
  return `USR-${String(max + 1).padStart(3, '0')}`;
}

/** Builds a new account. The role is ALWAYS "employee" — the admin role can never be created. */
export function createEmployeeAccount(list: SystemUser[], input: EmployeeAccountInput, now: Date = new Date()): SystemUser {
  return {
    id: nextUserId(list),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email.trim().toLowerCase(),
    role: 'employee',
    status: input.status,
    createdAt: format(now, 'yyyy-MM-dd'),
    lastActivity: null,
    avatarUrl: input.avatarUrl,
    mockPassword: input.mockPassword
  };
}

/** Applies editable fields only. Role is preserved; the admin account is never changed. */
export function applyEmployeeUpdate(user: SystemUser, input: EmployeeAccountInput): SystemUser {
  if (!canModifyUser(user)) return user;
  return {
    ...user,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email.trim().toLowerCase(),
    status: input.status,
    avatarUrl: input.avatarUrl,
    role: 'employee'
  };
}

// ---------- Validation ----------

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmployeeAccount(
input: EmployeeAccountInput,
list: SystemUser[],
editingId?: string)
: EmployeeAccountErrors {
  const errors: EmployeeAccountErrors = {};
  const email = input.email.trim().toLowerCase();

  if (!input.firstName.trim()) errors.firstName = 'First name is required.';
  if (!input.lastName.trim()) errors.lastName = 'Last name is required.';

  if (!email) errors.email = 'Email is required.';else
  if (!EMAIL_PATTERN.test(email)) errors.email = 'Please enter a valid email address.';else
  if (email === SYSTEM_ADMIN_EMAIL) errors.email = 'This email is reserved for the system administrator.';else
  if (list.some((u) => u.email.toLowerCase() === email && u.id !== editingId))
  errors.email = 'An account with this email already exists.';

  if (input.status !== 'active' && input.status !== 'inactive') errors.status = 'Status is required.';

  return errors;
}

// ---------- Formatting ----------

export function formatCreatedDate(isoDate: string): string {
  return format(parseISO(isoDate), 'MMMM d, yyyy');
}

export function formatLastActivity(isoDateTime: string | null): string {
  if (!isoDateTime) return 'Never signed in';
  const date = parseISO(isoDateTime);
  if (isToday(date)) return `Today, ${format(date, 'h:mm a')}`;
  if (isYesterday(date)) return `Yesterday, ${format(date, 'h:mm a')}`;
  return format(date, 'MMM d, yyyy');
}