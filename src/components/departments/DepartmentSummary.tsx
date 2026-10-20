import React from 'react';
import { Building2Icon, CircleCheckIcon, CircleSlashIcon, UsersRoundIcon } from 'lucide-react';
import type { Employee } from '../../types/employees';
import type { Department } from '../../types/organization';
import { summarizeDepartments } from '../../utils/organization';
import { StatCard } from '../ui/StatCard';

export function DepartmentSummary({ departments, employees }: {departments: Department[];employees: Employee[];}) {
  const s = summarizeDepartments(departments, employees);

  return (
    <section aria-label="Department summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total Departments" value={String(s.total)} icon={Building2Icon} tone="neutral" hint="All organizational units" />
      <StatCard label="Active Departments" value={String(s.active)} icon={CircleCheckIcon} tone="success" hint="Open for new assignments" />
      <StatCard label="Inactive Departments" value={String(s.inactive)} icon={CircleSlashIcon} tone={s.inactive > 0 ? 'warning' : 'neutral'} hint="Kept for history" />
      <StatCard label="Total Employees" value={String(s.employees)} icon={UsersRoundIcon} tone="primary" hint="Assigned to a department" />
    </section>);

}