import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDownIcon, LogOutIcon, XIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { navigation } from '../../data/navigation';
import type { NavLeaf } from '../../types/navigation';
import { cn } from '../../utils/cn';
import { isNavGroup, isVisibleToRole } from '../../utils/navigation';
import { roleLabels } from '../../utils/users';
import { Avatar } from '../ui/Avatar';
import { Logo } from './Logo';

interface SidebarProps {
  onClose?: () => void;
  onLogout: () => void;
}

const itemBase =
'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40';

export function Sidebar({ onClose, onLogout }: SidebarProps) {
  const { pathname } = useLocation();
  const { unreadCount } = useNotifications();
  const { user, account } = useAuth();

  const activeGroup = navigation.find((entry) => isNavGroup(entry) && entry.children.some((c) => c.path === pathname))?.label;
  const [openGroups, setOpenGroups] = useState<string[]>(() => activeGroup ? [activeGroup] : []);

  useEffect(() => {
    if (activeGroup) setOpenGroups((groups) => groups.includes(activeGroup) ? groups : [...groups, activeGroup]);
  }, [activeGroup]);

  const toggleGroup = (label: string) =>
  setOpenGroups((groups) => groups.includes(label) ? groups.filter((g) => g !== label) : [...groups, label]);

  const renderLeaf = (item: NavLeaf, nested = false) =>
  <NavLink
    to={item.path}
    className={({ isActive }) =>
    cn(
      itemBase,
      nested && 'py-1.5 pl-3',
      isActive ? 'bg-primary-soft text-primary' : 'text-muted hover:bg-ink/[0.04] hover:text-ink'
    )
    }>
    
      {!nested && <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden />}
      <span className="truncate">{item.label}</span>
      {item.showUnread && unreadCount > 0 &&
    <span className="ml-auto rounded-full bg-primary px-1.5 py-px text-[11px] font-semibold tabular-nums text-primary-fg">
          {unreadCount}
          <span className="sr-only"> unread</span>
        </span>
    }
    </NavLink>;


  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
        <Logo />
        {onClose &&
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
          className="-mr-1 rounded-md p-1.5 text-muted transition-colors duration-150 hover:bg-ink/5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
          
            <XIcon className="h-5 w-5" />
          </button>
        }
      </div>

      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {navigation.map((entry) => {
            if (!isNavGroup(entry)) {
              return isVisibleToRole(entry, user?.role) ? <li key={entry.path}>{renderLeaf(entry)}</li> : null;
            }

            const visibleChildren = entry.children.filter((child) => isVisibleToRole(child, user?.role));
            if (visibleChildren.length === 0) return null;
            const open = openGroups.includes(entry.label);
            const containsActive = entry.label === activeGroup;
            const listId = `nav-group-${entry.label.toLowerCase()}`;
            return (
              <li key={entry.label}>
                <button
                  type="button"
                  onClick={() => toggleGroup(entry.label)}
                  aria-expanded={open}
                  aria-controls={listId}
                  className={cn(itemBase, containsActive ? 'text-ink' : 'text-muted hover:bg-ink/[0.04] hover:text-ink')}>
                  
                  <entry.icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
                  <span className="truncate">{entry.label}</span>
                  <ChevronDownIcon
                    className={cn('ml-auto h-4 w-4 text-subtle transition-transform duration-200 ease-out', open && 'rotate-180')}
                    aria-hidden />
                  
                </button>
                <AnimatePresence initial={false}>
                  {open &&
                  <motion.div
                    id={listId}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                    className="ml-[21px] overflow-hidden border-l border-line pl-2.5">
                    
                      <ul className="space-y-0.5 py-1">
                        {visibleChildren.map((child) =>
                      <li key={child.path}>{renderLeaf(child, true)}</li>
                      )}
                      </ul>
                    </motion.div>
                  }
                </AnimatePresence>
              </li>);

          })}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-line p-3">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
          cn(
            'flex items-center gap-3 rounded-lg p-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
            isActive ? 'bg-primary-soft' : 'hover:bg-ink/[0.04]'
          )
          }>
          
          <Avatar name={user?.name ?? 'WorkSync user'} />
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-medium text-ink">{user?.name ?? 'WorkSync user'}</span>
            <span className="block truncate text-xs text-muted">{account ? roleLabels[account.role] : 'User'}</span>
          </span>
        </NavLink>
        <button
          type="button"
          onClick={onLogout}
          className={cn(itemBase, 'mt-1 text-muted hover:bg-danger/5 hover:text-danger')}>
          
          <LogOutIcon className="h-[18px] w-[18px] shrink-0" aria-hidden />
          Log out
        </button>
      </div>
    </div>);

}
