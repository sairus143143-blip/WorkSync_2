import React from 'react';
import type { EmploymentStatus } from '../../types/employees';
import type { BadgeTone } from '../../types/ui';
import { employmentStatusLabels } from '../../utils/employees';
import { Badge } from '../ui/Badge';

const tone: Record<EmploymentStatus, BadgeTone> = { active: 'success', on_leave: 'warning', inactive: 'neutral' };

export function EmploymentStatusBadge({ status }: {status: EmploymentStatus;}) {
  return (
    <Badge tone={tone[status]} dot>
      {employmentStatusLabels[status]}
    </Badge>);

}