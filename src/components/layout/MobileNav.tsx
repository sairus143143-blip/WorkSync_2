import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export function MobileNav({ open, onClose, onLogout }: MobileNavProps) {
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )).filter((element) => element.offsetWidth > 0 || element.offsetHeight > 0 || element === document.activeElement);
      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel)) {
        event.preventDefault();
        first.focus();
      }
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    const focusTimer = window.setTimeout(() => panelRef.current?.querySelector<HTMLElement>('a[href], button:not([disabled])')?.focus(), 40);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
      window.clearTimeout(focusTimer);
      previousFocus?.focus();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open &&
      <div className="fixed inset-0 z-40 lg:hidden">
          <motion.div
          className="absolute inset-0 bg-ink/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={onClose}
          aria-hidden />
        
          <motion.aside
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          tabIndex={-1}
          ref={panelRef}
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
          className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] shadow-pop">
          
            <Sidebar onClose={onClose} onLogout={onLogout} />
          </motion.aside>
        </div>
      }
    </AnimatePresence>);

}