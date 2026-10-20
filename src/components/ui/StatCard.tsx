import React from "react";
import { MinusIcon, TrendingDownIcon, TrendingUpIcon, BoxIcon } from "lucide-react";
import { cn } from "../../utils/cn";
import { StatTone } from "../../types/ui";
interface StatCardProps {
  label: string;
  value: string;
  icon?: BoxIcon;
  delta?: string;
  trend?: 'up' | 'down' | 'flat';
  /** Whether the trend direction is good news. */
  positive?: boolean;
  hint?: string;
  /** Colors the icon chip to signal status. */
  tone?: StatTone;
  featured?: boolean;
  className?: string;
}
const toneChip: Record<StatTone, string> = {
  neutral: 'bg-ink/[0.06] text-muted',
  primary: 'bg-primary-soft text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger'
};
export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  trend = 'flat',
  positive = true,
  hint,
  tone,
  featured = false,
  className
}: StatCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUpIcon : trend === 'down' ? TrendingDownIcon : MinusIcon;
  const trendColor = featured ? 'text-primary-fg' : trend === 'flat' ? 'text-muted' : positive ? 'text-success' : 'text-danger';
  return <div className={cn('flex flex-col rounded-xl border p-5', featured ? 'border-primary bg-primary text-primary-fg' : 'border-line bg-surface text-ink shadow-card', className)}>
      <div className="flex items-center justify-between gap-3">
        <p className={cn('text-sm font-medium', featured ? 'text-primary-fg/85' : 'text-muted')}>{label}</p>
        {Icon && (featured ? <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-fg/15 text-primary-fg" aria-hidden>
              <Icon className="h-4 w-4" />
            </span> : tone ? <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', toneChip[tone])} aria-hidden>
              <Icon className="h-4 w-4" />
            </span> : <Icon className="h-4 w-4 text-subtle" aria-hidden />)}
      </div>
      <p className="mt-2 text-[28px] font-semibold leading-9 tracking-tight tabular-nums">{value}</p>
      {(delta || hint) && <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-3 text-[13px]">
          {delta && <span className={cn('inline-flex items-center gap-1 font-medium', trendColor)}>
              <TrendIcon className="h-3.5 w-3.5" aria-hidden />
              {delta}
            </span>}
          {hint && <span className={featured ? 'text-primary-fg/80' : 'text-muted'}>{hint}</span>}
        </div>}
    </div>;
}