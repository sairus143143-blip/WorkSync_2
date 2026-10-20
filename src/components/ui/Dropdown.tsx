import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../utils/cn";
import { BoxIcon } from "lucide-react";
export interface DropdownItem {
  id: string;
  label: string;
  icon?: BoxIcon;
  onSelect: () => void;
  tone?: 'default' | 'danger';
  separatorBefore?: boolean;
}
interface DropdownProps {
  trigger: React.ReactNode;
  triggerLabel: string;
  triggerClassName?: string;
  align?: 'start' | 'end';
  panelClassName?: string;
  header?: React.ReactNode;
  items?: DropdownItem[];
  children?: (close: () => void) => React.ReactNode;
}
export function Dropdown({
  trigger,
  triggerLabel,
  triggerClassName,
  align = 'end',
  panelClassName,
  header,
  items,
  children
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const close = useCallback(() => setOpen(false), []);
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  const onPanelKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const elements = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    if (elements.length === 0) return;
    event.preventDefault();
    const index = elements.indexOf(document.activeElement as HTMLElement);
    const next = event.key === 'ArrowDown' ? (index + 1) % elements.length : (index - 1 + elements.length) % elements.length;
    elements[next]?.focus();
  };
  return <div ref={rootRef} className="relative">
      <button ref={triggerRef} type="button" aria-label={triggerLabel} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? panelId : undefined} onClick={() => setOpen((value) => !value)} className={cn('transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40', triggerClassName)}>
        {trigger}
      </button>
      <AnimatePresence>
        {open && <motion.div id={panelId} role="menu" aria-label={triggerLabel} onKeyDown={onPanelKeyDown} initial={{
        opacity: 0,
        scale: 0.96,
        y: -4
      }} animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }} exit={{
        opacity: 0,
        scale: 0.96,
        y: -4
      }} transition={{
        duration: 0.16,
        ease: [0.23, 1, 0.32, 1]
      }} style={{
        transformOrigin: align === 'end' ? 'top right' : 'top left'
      }} className={cn('absolute top-full z-40 mt-2 min-w-[224px] overflow-hidden rounded-xl border border-line bg-surface shadow-pop', align === 'end' ? 'right-0' : 'left-0', panelClassName)}>
            {header}
            {items && items.length > 0 && <div className="p-1.5">
                {items.map((item) => <React.Fragment key={item.id}>
                    {item.separatorBefore && <div role="separator" className="my-1.5 h-px bg-line" />}
                    <button type="button" role="menuitem" onClick={() => {
              item.onSelect();
              close();
            }} className={cn('flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors duration-150 focus-visible:outline-none', item.tone === 'danger' ? 'text-danger hover:bg-danger/5 focus-visible:bg-danger/5' : 'text-ink hover:bg-ink/5 focus-visible:bg-ink/5')}>
                      {item.icon && <item.icon className={cn('h-4 w-4', item.tone !== 'danger' && 'text-muted')} aria-hidden />}
                      {item.label}
                    </button>
                  </React.Fragment>)}
              </div>}
            {children?.(close)}
          </motion.div>}
      </AnimatePresence>
    </div>;
}