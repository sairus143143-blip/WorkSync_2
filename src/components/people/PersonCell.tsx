import React from 'react';
import { Avatar } from '../ui/Avatar';

interface PersonCellProps {
  name: string;
  subtitle?: string;
}

export function PersonCell({ name, subtitle }: PersonCellProps) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar name={name} size="sm" />
      <div className="min-w-0">
        <p className="truncate font-medium text-ink">{name}</p>
        {subtitle && <p className="truncate text-[13px] text-muted">{subtitle}</p>}
      </div>
    </div>);

}