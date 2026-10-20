import React from 'react';
import { LoaderCircleIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface LoadingStateProps {
  variant?: 'spinner' | 'skeleton' | 'table';
  label?: string;
  rows?: number;
  /** Table variant only: number of columns after the leading avatar column. */
  columns?: number;
  className?: string;
}

export function LoadingState({ variant = 'spinner', label = 'Loading…', rows = 4, columns = 4, className }: LoadingStateProps) {
  if (variant === 'table') {
    return (
      <div role="status" aria-busy="true" className={cn('w-full', className)}>
        <span className="sr-only">{label}</span>
        <div className="h-9 bg-bg/70" />
        {Array.from({ length: rows }, (_, row) =>
        <div key={row} className="flex items-center gap-6 border-t border-line px-5 py-3.5">
            <div className="flex min-w-0 flex-[2] items-center gap-3">
              <div className="h-7 w-7 shrink-0 animate-pulse rounded-full bg-ink/[0.07]" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-2/3 animate-pulse rounded bg-ink/[0.07]" />
                <div className="h-2.5 w-1/3 animate-pulse rounded bg-ink/[0.05]" />
              </div>
            </div>
            {Array.from({ length: columns }, (_, col) =>
          <div key={col} className={cn('h-3 flex-1 animate-pulse rounded bg-ink/[0.06]', col > 1 && 'hidden md:block')} />
          )}
          </div>
        )}
      </div>);

  }

  if (variant === 'skeleton') {
    return (
      <div role="status" aria-busy="true" className={cn('space-y-3', className)}>
        <span className="sr-only">{label}</span>
        {Array.from({ length: rows }, (_, index) =>
        <div key={index} className="flex items-center gap-3">
            <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-ink/[0.07]" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-2/5 animate-pulse rounded bg-ink/[0.07]" />
              <div className="h-3 w-3/5 animate-pulse rounded bg-ink/[0.05]" />
            </div>
          </div>
        )}
      </div>);

  }

  return (
    <div role="status" className={cn('flex flex-col items-center justify-center gap-3 py-12 text-sm text-muted', className)}>
      <LoaderCircleIcon className="h-6 w-6 animate-spin text-primary" aria-hidden />
      {label}
    </div>);

}