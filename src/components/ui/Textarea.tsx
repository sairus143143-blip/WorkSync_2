import React, { forwardRef, useId } from 'react';
import { cn } from '../../utils/cn';
import { fieldClass } from './Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
{ label, hint, error, id, className, rows = 3, ...rest },
ref)
{
  const autoId = useId();
  const fieldId = id ?? autoId;
  const messageId = `${fieldId}-message`;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={fieldId} className="text-[13px] font-medium text-ink">
        {label}
      </label>
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? messageId : undefined}
        className={cn(fieldClass, 'h-auto resize-y py-2 leading-relaxed', error ? 'border-danger' : 'border-line')}
        {...rest} />
      
      {(error || hint) &&
      <p id={messageId} className={cn('text-xs', error ? 'text-danger' : 'text-muted')}>
          {error ?? hint}
        </p>
      }
    </div>);

});