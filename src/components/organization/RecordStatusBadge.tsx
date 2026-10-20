import React from 'react';
import type { RecordStatus } from '../../types/organization';
import { recordStatusLabels } from '../../utils/organization';
import { Badge } from '../ui/Badge';

export function RecordStatusBadge({ status }: {status: RecordStatus;}) {
  return (
    <Badge tone={status === 'active' ? 'success' : 'neutral'} dot>
      {recordStatusLabels[status]}
    </Badge>);

}