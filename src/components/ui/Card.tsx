import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function Card({ title, description, action, children, className, bodyClassName }: CardProps) {
  return (
    <section className={cn('flex flex-col rounded-xl border border-line bg-surface shadow-card', className)}>
      {(title || action) &&
      <header className="flex items-start justify-between gap-4 px-5 pt-5">
          <div className="min-w-0">
            {title && <h2 className="text-[15px] font-semibold text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      }
      <div className={cn('flex-1 p-5', bodyClassName)}>{children}</div>
    </section>);

}