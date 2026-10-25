import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { employees as seedEmployees } from '../data/employees';
import type { Employee, EmployeeFormValues, EmploymentStatus } from '../types/employees';
import { nextEmployeeId } from '../utils/employees';
import { useUsers } from './UsersContext';

interface EmployeesContextValue {
  employees: Employee[];
  /** Creates an Employee-role user account AND the linked workforce record. */
  createEmployee: (values: EmployeeFormValues) => Employee;
  updateEmployee: (employeeId: string, values: EmployeeFormValues) => void;
  setEmploymentStatus: (employeeId: string, status: EmploymentStatus) => void;
}

const EmployeesContext = createContext<EmployeesContextValue | null>(null);
const STORAGE_KEY = 'worksync.employees.v1';

function readEmployees(): Employee[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return seedEmployees;
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return seedEmployees;
    return parsed.map((record) => {
      if (!record || typeof record !== 'object') return record;
      return Object.fromEntries(
        Object.entries(record).filter(([field]) => field !== 'departmentId' && field !== 'departmentName')
      ) as unknown as Employee;
    });
  } catch {
    return seedEmployees;
  }
}

function toRecordFields(values: EmployeeFormValues) {
  return {
    employeeNumber: values.employeeNumber.trim().toUpperCase(),
    firstName: values.firstName.trim(),
    middleName: values.middleName.trim(),
    lastName: values.lastName.trim(),
    phone: values.phone.trim(),
    address: values.address.trim(),
    positionId: values.positionId,
    dateHired: values.dateHired,
    employmentStatus: (values.employmentStatus || 'active') as EmploymentStatus,
    avatar: values.avatar
  };
}

/**
 * Mock workforce store. Account changes go through UsersContext so the user record stays the
 * single source for email, role and account status. New accounts are always role "employee".
 */
export function EmployeesProvider({ children }: {children: React.ReactNode;}) {
  const { users, createEmployee: createUserAccount, updateEmployee: updateUserAccount, setEmployeeStatus } = useUsers();
  const [list, setList] = useState<Employee[]>(readEmployees);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Storage may be unavailable in a sandboxed preview.
    }
  }, [list]);

  const createEmployee = useCallback(
    (values: EmployeeFormValues) => {
      const fields = toRecordFields(values);
      const account = createUserAccount({
        firstName: fields.firstName,
        lastName: fields.lastName,
        email: values.email,
        status: fields.employmentStatus === 'inactive' ? 'inactive' : 'active',
        avatarUrl: fields.avatar ?? undefined,
        mockPassword: values.password
      });
      const record: Employee = { id: nextEmployeeId(list), userId: account.id, ...fields };
      setList((current) => [...current, record]);
      return record;
    },
    [list, createUserAccount]
  );

  const updateEmployee = useCallback(
    (employeeId: string, values: EmployeeFormValues) => {
      const existing = list.find((e) => e.id === employeeId);
      if (!existing) return;
      const fields = toRecordFields(values);
      setList((current) => current.map((e) => e.id === employeeId ? { ...e, ...fields, userId: e.userId } : e));

      const account = users.find((u) => u.id === existing.userId);
      if (account) {
        updateUserAccount(account.id, {
          firstName: fields.firstName,
          lastName: fields.lastName,
          email: values.email,
          status: account.status,
          avatarUrl: fields.avatar ?? undefined
        });
      }
    },
    [list, users, updateUserAccount]
  );

  const setEmploymentStatus = useCallback(
    (employeeId: string, status: EmploymentStatus) => {
      const existing = list.find((e) => e.id === employeeId);
      if (!existing) return;
      setList((current) => current.map((e) => e.id === employeeId ? { ...e, employmentStatus: status } : e));
      // Leaving the organization disables access; returning restores it. Leave keeps the account active.
      if (status === 'inactive') setEmployeeStatus(existing.userId, 'inactive');
      if (existing.employmentStatus === 'inactive' && status === 'active') setEmployeeStatus(existing.userId, 'active');
    },
    [list, setEmployeeStatus]
  );

  const value = useMemo(
    () => ({ employees: list, createEmployee, updateEmployee, setEmploymentStatus }),
    [list, createEmployee, updateEmployee, setEmploymentStatus]
  );

  return <EmployeesContext.Provider value={value}>{children}</EmployeesContext.Provider>;
}

export function useEmployees(): EmployeesContextValue {
  const context = useContext(EmployeesContext);
  if (!context) throw new Error('useEmployees must be used inside EmployeesProvider');
  return context;
}