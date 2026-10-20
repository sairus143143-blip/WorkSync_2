import React from "react";
import { cn } from "../../utils/cn";
import { BoxIcon } from "lucide-react";
interface EmptyStateProps {
  icon: BoxIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return <div className={cn('flex flex-col items-center px-6 py-12 text-center', className)}>
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary" aria-hidden>
        <Icon className="h-6 w-6" />
      </span>
      <h2 className="mt-4 text-base font-semibold text-ink">{title}</h2>
      {description && <p className="mt-1.5 max-w-md text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>;
}