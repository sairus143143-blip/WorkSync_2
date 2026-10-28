import React, { forwardRef, useId } from 'react';
import { cn } from '../../utils/cn';

export const fieldClass =
'h-10 w-full rounded-lg border bg-surface px-3 text-sm text-ink placeholder:text-subtle transition-[border-color,box-shadow] duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-bg disabled:text-muted';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  hideLabel?: boolean;
  leftIcon?: React.ReactNode;
  /** Interactive element shown inside the field on the right, e.g. a show/hide toggle. */
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
{ label, hint, error, hideLabel = false, leftIcon, rightElement, id, className, ...rest },
ref)
{
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-message`;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label &&
      <label htmlFor={inputId} className={cn('text-[13px] font-medium text-ink', hideLabel && 'sr-only')}>
          {label}
        </label>
      }
      <div className="relative">
        {leftIcon &&
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-subtle">{leftIcon}</span>
        }
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? messageId : undefined}
          className={cn(fieldClass, error ? 'border-danger' : 'border-line', Boolean(leftIcon) && 'pl-9', Boolean(rightElement) && 'pr-10')}
          {...rest} />
        
        {rightElement && <span className="absolute inset-y-0 right-1 flex items-center">{rightElement}</span>}
      </div>
      {(error || hint) &&
      <p id={messageId} className={cn('text-xs', error ? 'text-danger' : 'text-muted')}>
          {error ?? hint}
        </p>
      }
    </div>);

});