import React from 'react';
import type { AccountStatus } from '../../types/users';
import { statusLabels } from '../../utils/users';
import { Badge } from '../ui/Badge';

export function AccountStatusBadge({ status }: {status: AccountStatus;}) {
  return (
    <Badge tone={status === 'active' ? 'success' : 'neutral'} dot>
      {statusLabels[status]}
    </Badge>);

}