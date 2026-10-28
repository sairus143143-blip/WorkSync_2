import React, { forwardRef } from 'react';
import { LoaderCircleIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  loading?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-fg hover:bg-primary-hover',
  secondary: 'border border-line bg-surface text-ink hover:bg-ink/[0.03]',
  ghost: 'text-muted hover:bg-ink/5 hover:text-ink',
  danger: 'bg-danger text-white hover:bg-danger/90'
};

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-9 gap-1.5 px-3 text-[13px]',
  md: 'h-10 gap-2 px-3.5 text-sm',
  icon: 'h-10 w-10'
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
{ variant = 'primary', size = 'md', leftIcon, loading = false, className, children, disabled, type = 'button', ...rest },
ref)
{
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg font-medium',
        'transition-[background-color,color,border-color,transform] duration-150 ease-out active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}>
      
      {loading ? <LoaderCircleIcon className="h-4 w-4 animate-spin" aria-hidden /> : leftIcon}
      {children}
    </button>);

});