import React from 'react';
import { cn } from '../../utils/cn';
import type { ProgressTone } from '../../types/ui';

interface ProgressBarProps {
  value: number;
  max?: number;
  tone?: ProgressTone;
  size?: 'sm' | 'md';
  label?: string;
  showValue?: boolean;
  className?: string;
}

const tones: Record<ProgressTone, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger'
};

export function ProgressBar({
  value,
  max = 100,
  tone = 'primary',
  size = 'sm',
  label,
  showValue = false,
  className
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, Math.round(value / max * 100)));
  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) &&
      <div className="mb-1.5 flex items-center justify-between gap-2 text-[13px]">
          {label && <span className="truncate text-muted">{label}</span>}
          {showValue && <span className="font-medium tabular-nums text-ink">{percent}%</span>}
        </div>
      }
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
        className={cn('w-full overflow-hidden rounded-full bg-ink/[0.07]', size === 'sm' ? 'h-1.5' : 'h-2.5')}>
        
        <div
          className={cn('h-full rounded-full transition-[width] duration-300 ease-out', tones[tone])}
          style={{ width: `${percent}%` }} />
        
      </div>
    </div>);

}