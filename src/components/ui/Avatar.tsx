import React from 'react';
import { cn } from '../../utils/cn';
import { initials } from '../../utils/format';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const palettes = [
'bg-primary-soft text-primary',
'bg-info/10 text-info',
'bg-success/10 text-success',
'bg-warning/10 text-warning'];


const sizes = {
  sm: 'h-7 w-7 text-[11px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-16 w-16 text-lg'
};

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  if (src) {
    return <img src={src} alt="" aria-hidden className={cn('shrink-0 rounded-full object-cover', sizes[size], className)} />;
  }
  const hash = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold',
        palettes[hash % palettes.length],
        sizes[size],
        className
      )}>
      
      {initials(name)}
    </span>);

}