import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface TabItem<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface TabsProps<T extends string> {
  /** Accessible name for the tab list. */
  label: string;
  /** Unique prefix used to link tabs to their panels. */
  idPrefix: string;
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function Tabs<T extends string>({ label, idPrefix, items, value, onChange, className }: TabsProps<T>) {
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const index = items.findIndex((item) => item.value === value);
    const nextIndex = event.key === 'ArrowRight' ? (index + 1) % items.length : (index - 1 + items.length) % items.length;
    const next = items[nextIndex];
    if (!next) return;
    onChange(next.value);
    document.getElementById(`${idPrefix}-tab-${next.value}`)?.focus();
  };

  return (
    <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className={cn('flex gap-5 border-b border-line', className)}>
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            id={`${idPrefix}-tab-${item.value}`}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={`${idPrefix}-panel-${item.value}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(item.value)}
            className={cn(
              'relative -mb-px inline-flex items-center gap-1.5 whitespace-nowrap pb-2.5 text-[13px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
              active ? 'text-ink' : 'text-muted hover:text-ink'
            )}>
            
            {item.label}
            {item.count !== undefined && <span className="tabular-nums text-subtle">{item.count}</span>}
            {active &&
            <motion.span
              layoutId={`${idPrefix}-underline`}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />

            }
          </button>);

      })}
    </div>);

}

export function tabPanelProps(idPrefix: string, value: string) {
  return {
    role: 'tabpanel' as const,
    id: `${idPrefix}-panel-${value}`,
    'aria-labelledby': `${idPrefix}-tab-${value}`
  };
}