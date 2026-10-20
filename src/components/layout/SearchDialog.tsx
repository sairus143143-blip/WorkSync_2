import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CornerDownLeftIcon, SearchXIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { allRoutes, isVisibleToRole } from '../../utils/navigation';
import { EmptyState } from '../ui/EmptyState';
import { Modal } from '../ui/Modal';
import { SearchInput } from '../ui/SearchInput';

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

/** Jump-to-page search. Searching records arrives with each module in later phases. */
export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (open) setQuery('');
  }, [open]);

  const q = query.trim().toLowerCase();
  const results = allRoutes.filter(
    (r) => isVisibleToRole(r, user?.role) && (!q || `${r.title} ${r.parent ?? ''}`.toLowerCase().includes(q))
  );

  const go = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Search WorkSync" description="Jump to any page.">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (results[0]) go(results[0].path);
        }}>
        
        <SearchInput value={query} onChange={setQuery} label="Search pages" placeholder="Type a page name…" />
      </form>
      {results.length === 0 ?
      <EmptyState icon={SearchXIcon} title="No matching pages" description={`Nothing matches “${query}”.`} className="py-8" /> :

      <ul className="mt-3 max-h-[320px] space-y-0.5 overflow-y-auto">
          {results.map((route, index) =>
        <li key={route.path}>
              <button
            type="button"
            onClick={() => go(route.path)}
            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors duration-150 hover:bg-ink/[0.04] focus-visible:bg-ink/[0.05] focus-visible:outline-none">
            
                <route.icon className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-sm text-ink">{route.title}</span>
                {route.parent && <span className="text-xs text-subtle">{route.parent}</span>}
                {index === 0 && q && <CornerDownLeftIcon className="h-3.5 w-3.5 text-subtle" aria-label="Press Enter" />}
              </button>
            </li>
        )}
        </ul>
      }
    </Modal>);

}