import React from 'react';
import type { AssignmentRowStatus } from '../../types/assignments';
import type { BadgeTone } from '../../types/ui';
import { ASSIGNMENT_STATUS_LABELS } from '../../utils/assignments';
import { Badge } from '../ui/Badge';

const tones: Record<AssignmentRowStatus, BadgeTone> = {
  assigned: 'success',
  unassigned: 'warning',
  inactive: 'neutral'
};

export function AssignmentStatusBadge({ status }: {status: AssignmentRowStatus;}) {
  return (
    <Badge tone={tones[status]} dot>
      {ASSIGNMENT_STATUS_LABELS[status]}
    </Badge>);

}