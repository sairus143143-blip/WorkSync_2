import React, { forwardRef, useId } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { fieldClass } from './Input';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label: string;
  options: SelectOption[];
  hint?: string;
  error?: string;
  hideLabel?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
{ label, options, hint, error, hideLabel = false, id, className, ...rest },
ref)
{
  const autoId = useId();
  const selectId = id ?? autoId;
  const messageId = `${selectId}-message`;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={selectId} className={cn('text-[13px] font-medium text-ink', hideLabel && 'sr-only')}>
        {label}
      </label>
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? messageId : undefined}
          className={cn(fieldClass, 'cursor-pointer appearance-none pr-9', error ? 'border-danger' : 'border-line')}
          {...rest}>
          
          {options.map((option) =>
          <option key={option.value} value={option.value}>
              {option.label}
            </option>
          )}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden />
      </div>
      {(error || hint) &&
      <p id={messageId} className={cn('text-xs', error ? 'text-danger' : 'text-muted')}>
          {error ?? hint}
        </p>
      }
    </div>);

});