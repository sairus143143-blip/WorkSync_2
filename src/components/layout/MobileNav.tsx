import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export function MobileNav({ open, onClose, onLogout }: MobileNavProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
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