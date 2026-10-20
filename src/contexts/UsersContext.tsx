import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { users as seedUsers } from '../data/users';
import type { AccountStatus, EmployeeAccountInput, SystemUser } from '../types/users';
import { applyEmployeeUpdate, canModifyUser, createEmployeeAccount } from '../utils/users';

interface UsersContextValue {
  users: SystemUser[];
  createEmployee: (input: EmployeeAccountInput) => SystemUser;
  updateEmployee: (id: string, input: EmployeeAccountInput) => void;
  setEmployeeStatus: (id: string, status: AccountStatus) => void;
}

const UsersContext = createContext<UsersContextValue | null>(null);
const STORAGE_KEY = 'worksync.users.v1';

function readUsers(): SystemUser[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return seedUsers;
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed) || !parsed.some((user) => user?.id === 'USR-001' && user?.role === 'admin')) return seedUsers;
    return parsed as SystemUser[];
  } catch {
    return seedUsers;
  }
}

/**
 * Mock user store. Every mutation goes through the role rules in utils/users.ts,
 * so the single admin account can never be duplicated, demoted or deactivated.
 */
export function UsersProvider({ children }: {children: React.ReactNode;}) {
  const [list, setList] = useState<SystemUser[]>(readUsers);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Storage may be unavailable in a sandboxed preview.
    }
  }, [list]);

  const createEmployee = useCallback(
    (input: EmployeeAccountInput) => {
      const account = createEmployeeAccount(list, input);
      setList((current) => [...current, account]);
      return account;
    },
    [list]
  );

  const updateEmployee = useCallback((id: string, input: EmployeeAccountInput) => {
    setList((current) => current.map((u) => u.id === id ? applyEmployeeUpdate(u, input) : u));
  }, []);

  const setEmployeeStatus = useCallback((id: string, status: AccountStatus) => {
    setList((current) => current.map((u) => u.id === id && canModifyUser(u) ? { ...u, status } : u));
  }, []);

  const value = useMemo(
    () => ({ users: list, createEmployee, updateEmployee, setEmployeeStatus }),
    [list, createEmployee, updateEmployee, setEmployeeStatus]
  );

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
}

export function useUsers(): UsersContextValue {
  const context = useContext(UsersContext);
  if (!context) throw new Error('useUsers must be used inside UsersProvider');
  return context;
}