import React, { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { findRoute } from '../../utils/navigation';
import { Header } from './Header';
import { LogoutDialog } from './LogoutDialog';
import { MobileNav } from './MobileNav';
import { SearchDialog } from './SearchDialog';
import { Sidebar } from './Sidebar';
import { useSettings } from '../../contexts/SettingsContext';

export function AppLayout() {
  const { settings } = useSettings();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const closeLogout = useCallback(() => setLogoutOpen(false), []);
  const openLogout = useCallback(() => {
    setMobileOpen(false);
    setLogoutOpen(true);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo({ top: 0 });
    const title = findRoute(pathname)?.title ?? 'Page not found';
    document.title = `${title} · ${settings.systemName}`;
  }, [pathname, settings.systemName]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="min-h-screen w-full bg-bg text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:shadow-pop">
        
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line lg:block">
        <Sidebar onLogout={openLogout} />
      </aside>
      <MobileNav open={mobileOpen} onClose={closeMobile} onLogout={openLogout} />

      <div className="lg:pl-64">
        <Header onOpenMenu={() => setMobileOpen(true)} onOpenSearch={() => setSearchOpen(true)} onLogout={openLogout} />
        <main id="main" className="mx-auto w-full max-w-[1360px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>

      <SearchDialog open={searchOpen} onClose={closeSearch} />
      <LogoutDialog open={logoutOpen} onClose={closeLogout} />
    </div>);

}
