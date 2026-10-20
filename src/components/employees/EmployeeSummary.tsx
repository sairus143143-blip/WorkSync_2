import React from 'react';
import { CalendarOffIcon, SparklesIcon, UserCheckIcon, UsersRoundIcon, UserXIcon } from 'lucide-react';
import type { Employee } from '../../types/employees';
import { NEW_HIRE_WINDOW_DAYS, summarizeEmployees } from '../../utils/employees';
import { StatCard } from '../ui/StatCard';

export function EmployeeSummary({ employees }: {employees: Employee[];}) {
  const s = summarizeEmployees(employees);

  return (
    <section aria-label="Employee summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <StatCard label="Total Employees" value={String(s.total)} icon={UsersRoundIcon} tone="neutral" hint="All workforce records" />
      <StatCard label="Active Employees" value={String(s.active)} icon={UserCheckIcon} tone="success" hint="Currently working" />
      <StatCard label="Inactive Employees" value={String(s.inactive)} icon={UserXIcon} tone="neutral" hint="No longer with the organization" />
      <StatCard label="On Leave" value={String(s.onLeave)} icon={CalendarOffIcon} tone="warning" hint="Temporarily away" />
      <StatCard label="New Hires" value={String(s.newHires)} icon={SparklesIcon} tone="primary" hint={`Hired in the last ${NEW_HIRE_WINDOW_DAYS} days`} />
    </section>);

}