import React from 'react';
import { ShieldCheckIcon } from 'lucide-react';
import type { UserRole } from '../../types/users';
import { roleDescriptions } from '../../utils/users';
import { Badge } from '../ui/Badge';

interface RoleBadgeProps {
  role: UserRole;
  showDescription?: boolean;
}

export function RoleBadge({ role, showDescription = false }: RoleBadgeProps) {
  const badge =
  role === 'admin' ?
  <Badge tone="primary">
        <ShieldCheckIcon className="h-3.5 w-3.5" aria-hidden />
        Admin
      </Badge> :

  <Badge tone="neutral">Employee</Badge>;


  if (!showDescription) return badge;
  return (
    <span className="inline-flex flex-col items-start gap-1">
      {badge}
      <span className="text-xs text-muted">{roleDescriptions[role]}</span>
    </span>);

}