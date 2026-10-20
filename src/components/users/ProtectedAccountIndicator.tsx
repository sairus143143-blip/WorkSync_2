import React from 'react';
import { LockIcon } from 'lucide-react';
import { PROTECTED_ACCOUNT_MESSAGE } from '../../utils/users';
import { Tooltip } from '../ui/Tooltip';

export function ProtectedAccountIndicator() {
  return (
    <Tooltip content={PROTECTED_ACCOUNT_MESSAGE} side="left">
      <button
        type="button"
        className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg bg-primary-soft px-2.5 text-xs font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
        
        <LockIcon className="h-3.5 w-3.5" aria-hidden />
        Protected
      </button>
    </Tooltip>);

}