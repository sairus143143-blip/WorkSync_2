import React from 'react';
import { BriefcaseIcon, CircleCheckIcon, CircleDashedIcon, CircleSlashIcon, UsersRoundIcon } from 'lucide-react';
import type { Employee } from '../../types/employees';
import type { Position } from '../../types/organization';
import { summarizePositions } from '../../utils/organization';
import { StatCard } from '../ui/StatCard';

export function PositionSummary({ positions, employees }: {positions: Position[];employees: Employee[];}) {
  const s = summarizePositions(positions, employees);

  return (
    <section aria-label="Position summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <StatCard label="Total Positions" value={String(s.total)} icon={BriefcaseIcon} tone="neutral" hint="Available job titles" />
      <StatCard label="Active Positions" value={String(s.active)} icon={CircleCheckIcon} tone="success" hint="Open for new assignments" />
      <StatCard label="Inactive Positions" value={String(s.inactive)} icon={CircleSlashIcon} tone={s.inactive > 0 ? 'warning' : 'neutral'} hint="Kept for history" />
      <StatCard label="Assigned Positions" value={String(s.assigned)} icon={UsersRoundIcon} tone="primary" hint="Held by at least one employee" />
      <StatCard label="Unassigned Positions" value={String(s.unassigned)} icon={CircleDashedIcon} tone="neutral" hint="No employees yet" />
    </section>);

}