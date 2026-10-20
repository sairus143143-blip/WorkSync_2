import React from 'react';
import { motion } from 'framer-motion';
import { CircleAlertIcon, CircleCheckIcon, InfoIcon, XIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export type ToastTone = 'success' | 'error' | 'info';

interface ToastProps {
  title: string;
  description?: string;
  tone: ToastTone;
  onDismiss: () => void;
}

const toneIcon = { success: CircleCheckIcon, error: CircleAlertIcon, info: InfoIcon };
const toneColor = { success: 'text-success', error: 'text-danger', info: 'text-info' };

export function Toast({ title, description, tone, onDismiss }: ToastProps) {
  const Icon = toneIcon[tone];
  return (
    <motion.div
      layout
      role={tone === 'error' ? 'alert' : 'status'}
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
      className="pointer-events-auto flex w-full items-start gap-3 rounded-xl border border-line bg-surface p-3.5 shadow-pop">
      
      <Icon className={cn('mt-0.5 h-[18px] w-[18px] shrink-0', toneColor[tone])} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">{title}</p>
        {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="-m-1 rounded-md p-1 text-subtle transition-colors duration-150 hover:bg-ink/5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
        
        <XIcon className="h-4 w-4" />
      </button>
    </motion.div>);

}