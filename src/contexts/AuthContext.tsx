import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { currentUser } from '../data/currentUser';
import { demoCredentials } from '../data/mockAuth';
import { useUsers } from './UsersContext';
import { useEmployees } from './EmployeesContext';
import type { User } from '../types/user';
import type { SystemUser } from '../types/users';
import type { EmployeeFormValues } from '../types/employees';
import { nextEmployeeNumber } from '../utils/employees';
import { currentDateOnly } from '../utils/progressReports';

interface AuthContextValue {
  user: User | null;
  account: SystemUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, remember: boolean) => boolean;
  registerEmployee: (firstName: string, lastName: string, email: string, password: string) => boolean;
  logout: () => void;
}

const STORAGE_KEY = 'worksync.mockSession';
const AuthContext = createContext<AuthContextValue | null>(null);

function readSession(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1' || sessionStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function readSessionUserId(): string | null {
  try {
    return localStorage.getItem(`${STORAGE_KEY}.user`) ?? sessionStorage.getItem(`${STORAGE_KEY}.user`);
  } catch {
    return null;
  }
}

function writeSession(remember: boolean) {
  try {
    (remember ? localStorage : sessionStorage).setItem(STORAGE_KEY, '1');
  } catch {

    // Storage unavailable (e.g. sandboxed preview) — session lives in memory only.
  }}

function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {

    // ignore
  }}

/** Mock admin authentication. No backend: credentials are checked against temporary demo values. */
export function AuthProvider({ children }: {children: React.ReactNode;}) {
  const { users } = useUsers();
  const { employees: employeeRecords, createEmployee } = useEmployees();
  const [accountId, setAccountId] = useState<string | null>(readSessionUserId);
  const storedAccount = accountId ? users.find((candidate) => candidate.id === accountId) : undefined;
  const linkedEmployee = storedAccount?.role === 'employee' ? employeeRecords.find((employee) => employee.userId === storedAccount.id) : undefined;
  const isAuthenticated = Boolean(
    readSession() && storedAccount?.status === 'active' &&
    (storedAccount.role === 'admin' || linkedEmployee && linkedEmployee.employmentStatus !== 'inactive')
  );

  useEffect(() => {
    if (!accountId || isAuthenticated) return;
    clearSession();
    try {
      localStorage.removeItem(`${STORAGE_KEY}.user`);
      sessionStorage.removeItem(`${STORAGE_KEY}.user`);
    } catch { /* ignore */ }
    setAccountId(null);
  }, [accountId, isAuthenticated]);

  const login = useCallback((email: string, password: string, remember: boolean) => {
    const normalizedEmail = email.trim().toLowerCase();
    const account = users.find((candidate) => candidate.email.toLowerCase() === normalizedEmail && candidate.status === 'active' && (candidate.mockPassword === password || candidate.id === 'USR-001' && password === demoCredentials.password));
    if (!account) return false;
    if (account.role === 'employee' && !employeeRecords.some((employee) => employee.userId === account.id && employee.employmentStatus !== 'inactive')) return false;
    writeSession(remember);
    try {
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem(`${STORAGE_KEY}.user`, account.id);
      (remember ? sessionStorage : localStorage).removeItem(`${STORAGE_KEY}.user`);
    } catch { /* session is retained in memory */ }
    setAccountId(account.id);
    return true;
  }, [users, employeeRecords]);

  const registerEmployee = useCallback((firstName: string, lastName: string, email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (users.some((candidate) => candidate.email.toLowerCase() === normalizedEmail)) return false;
    const today = currentDateOnly();
    const values: EmployeeFormValues = {
      firstName: firstName.trim(),
      middleName: '',
      lastName: lastName.trim(),
      email: normalizedEmail,
      password,
      confirmPassword: password,
      phone: '',
      address: '',
      avatar: null,
      employeeNumber: nextEmployeeNumber(employeeRecords),
      departmentId: '',
      positionId: '',
      dateHired: today,
      employmentStatus: 'active'
    };
    const employee = createEmployee(values);
    writeSession(true);
    try {
      localStorage.setItem(`${STORAGE_KEY}.user`, employee.userId);
      sessionStorage.removeItem(`${STORAGE_KEY}.user`);
    } catch { /* session is retained in memory */ }
    setAccountId(employee.userId);
    return true;
  }, [createEmployee, employeeRecords, users]);

  const logout = useCallback(() => {
    clearSession();
    try { localStorage.removeItem(`${STORAGE_KEY}.user`); sessionStorage.removeItem(`${STORAGE_KEY}.user`); } catch { /* ignore */ }
    setAccountId(null);
  }, []);

  const value = useMemo(
    () => {
      const account = isAuthenticated ? storedAccount ?? null : null;
      const user = account ? account.id === currentUser.id ? currentUser : { id: account.id, name: `${account.firstName} ${account.lastName}`, email: account.email, role: account.role, title: 'Employee' } : null;
      return { user, account, isAuthenticated, login, registerEmployee, logout };
    },
    [isAuthenticated, login, logout, registerEmployee, storedAccount]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
