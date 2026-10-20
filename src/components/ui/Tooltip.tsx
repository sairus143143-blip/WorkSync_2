import React, { useId } from 'react';
import { cn } from '../../utils/cn';

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  side?: 'top' | 'left';
  className?: string;
}

/** Lightweight hover/focus tooltip. The child must be focusable. */
export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  const id = useId();
  return (
    <span className="group/tooltip relative inline-flex">
      {React.cloneElement(children, { 'aria-describedby': id })}
      <span
        id={id}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute z-30 w-64 rounded-lg bg-ink px-3 py-2 text-left text-xs font-normal leading-snug text-white opacity-0 shadow-pop transition-opacity duration-150 ease-out group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100',
          side === 'top' ? 'bottom-full left-1/2 mb-2 -translate-x-1/2' : 'right-full top-1/2 mr-2 -translate-y-1/2',
          className
        )}>
        
        {content}
      </span>
    </span>);

}