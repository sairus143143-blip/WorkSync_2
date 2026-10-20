import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRightIcon, MenuIcon, SearchIcon } from 'lucide-react';
import { findRoute } from '../../utils/navigation';
import { NotificationMenu } from './NotificationMenu';
import { ProfileMenu } from './ProfileMenu';

interface HeaderProps {
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  onLogout: () => void;
}

export function Header({ onOpenMenu, onOpenSearch, onLogout }: HeaderProps) {
  const { pathname } = useLocation();
  const route = findRoute(pathname);
  const title = route?.title ?? 'Page not found';
  const isDashboard = pathname === '/dashboard';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open navigation"
        className="-ml-1 rounded-lg p-2 text-muted transition-colors duration-150 hover:bg-ink/5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 lg:hidden">
        
        <MenuIcon className="h-5 w-5" />
      </button>

      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <ol className="flex min-w-0 items-center gap-1.5 text-sm">
          {!isDashboard &&
          <>
              <li className="hidden sm:block">
                <Link to="/dashboard" className="rounded text-muted transition-colors duration-150 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                  Dashboard
                </Link>
              </li>
              <ChevronRightIcon className="hidden h-3.5 w-3.5 shrink-0 text-subtle sm:block" aria-hidden />
            </>
          }
          {route?.parent &&
          <>
              <li className="hidden text-muted md:block">{route.parent}</li>
              <ChevronRightIcon className="hidden h-3.5 w-3.5 shrink-0 text-subtle md:block" aria-hidden />
            </>
          }
          <li aria-current="page" className="truncate font-semibold text-ink">
            {title}
          </li>
        </ol>
      </nav>

      <button
        type="button"
        onClick={onOpenSearch}
        className="hidden h-9 w-60 items-center gap-2 rounded-lg border border-line bg-bg px-3 text-sm text-subtle transition-colors duration-150 hover:border-subtle/50 hover:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 md:flex lg:w-72">
        
        <SearchIcon className="h-4 w-4" aria-hidden />
        Search…
        <kbd className="ml-auto rounded border border-line bg-surface px-1.5 py-px font-sans text-[11px] text-muted">Ctrl K</kbd>
      </button>
      <button
        type="button"
        onClick={onOpenSearch}
        aria-label="Search"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors duration-150 hover:bg-ink/5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 md:hidden">
        
        <SearchIcon className="h-[18px] w-[18px]" />
      </button>

      <div className="flex items-center gap-1 sm:gap-2">
        <NotificationMenu />
        <div className="h-6 w-px bg-line" aria-hidden />
        <ProfileMenu onLogout={onLogout} />
      </div>
    </header>);

}