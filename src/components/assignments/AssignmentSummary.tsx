import React from 'react';
import { BriefcaseIcon, CircleCheckIcon, CircleDashedIcon, CircleSlashIcon, ShieldCheckIcon } from 'lucide-react';
import type { PositionAdminAssignment } from '../../types/assignments';
import type { Position } from '../../types/organization';
import { summarizeAssignments } from '../../utils/assignments';
import { StatCard } from '../ui/StatCard';

export function AssignmentSummary({ positions, assignments }: {positions: Position[];assignments: PositionAdminAssignment[];}) {
  const s = summarizeAssignments(positions, assignments);

  return (
    <section aria-label="Assignment summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <StatCard label="Total Positions" value={String(s.totalPositions)} icon={BriefcaseIcon} tone="neutral" hint="From Position Management" />
      <StatCard label="Assigned Positions" value={String(s.assignedPositions)} icon={ShieldCheckIcon} tone="primary" hint="Have an active responsibility" />
      <StatCard
        label="Unassigned Positions"
        value={String(s.unassignedPositions)}
        icon={CircleDashedIcon}
        tone={s.unassignedPositions > 0 ? 'warning' : 'neutral'}
        hint="No active responsibility" />
      
      <StatCard label="Active Assignments" value={String(s.activeAssignments)} icon={CircleCheckIcon} tone="success" hint="Status: Assigned" />
      <StatCard label="Inactive Assignments" value={String(s.inactiveAssignments)} icon={CircleSlashIcon} tone="neutral" hint="Kept for history" />
    </section>);

}