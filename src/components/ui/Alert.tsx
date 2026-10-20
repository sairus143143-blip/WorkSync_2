import React from 'react';
import { CircleAlertIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon, XIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

type AlertTone = 'info' | 'success' | 'warning' | 'danger';

interface AlertProps {
  tone?: AlertTone;
  title: string;
  children?: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const icons = { info: InfoIcon, success: CircleCheckIcon, warning: TriangleAlertIcon, danger: CircleAlertIcon };
const tones: Record<AlertTone, string> = {
  info: 'border-info/20 bg-info/[0.06] text-info',
  success: 'border-success/20 bg-success/[0.06] text-success',
  warning: 'border-warning/20 bg-warning/[0.06] text-warning',
  danger: 'border-danger/20 bg-danger/[0.06] text-danger'
};

export function Alert({ tone = 'info', title, children, onDismiss, className }: AlertProps) {
  const Icon = icons[tone];
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} className={cn('flex items-start gap-3 rounded-xl border px-4 py-3', tones[tone], className)}>
      <Icon className="mt-0.5 h-[18px] w-[18px] shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">{title}</p>
        {children && <div className="mt-0.5 text-[13px] text-muted">{children}</div>}
      </div>
      {onDismiss &&
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="-m-1 rounded-md p-1 text-subtle transition-colors duration-150 hover:bg-ink/5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
        
          <XIcon className="h-4 w-4" />
        </button>
      }
    </div>);

}