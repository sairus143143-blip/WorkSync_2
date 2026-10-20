import { useMemo, useState } from 'react';
import type { RoleFilter, StatusFilter, SystemUser, UserSort, UserSortKey } from '../types/users';
import { displayName, isSystemAdmin } from '../utils/users';

const statusOrder = { active: 0, inactive: 1 };

function compare(a: SystemUser, b: SystemUser, key: UserSortKey): number {
  switch (key) {
    case 'name':
      return displayName(a).localeCompare(displayName(b));
    case 'createdAt':
      return a.createdAt.localeCompare(b.createdAt);
    case 'lastActivity':
      return (a.lastActivity ?? '').localeCompare(b.lastActivity ?? '');
    case 'status':
      return statusOrder[a.status] - statusOrder[b.status];
  }
}

/** Search, filter and sort for the user table. The protected admin row always stays pinned first. */
export function useUserDirectory(users: SystemUser[]) {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<RoleFilter>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<UserSort>({ key: 'name', direction: 'asc' });

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = users.filter(
      (u) =>
      (role === 'all' || u.role === role) && (
      status === 'all' || u.status === status) && (
      !q || `${displayName(u)} ${u.firstName} ${u.lastName} ${u.email} ${u.id}`.toLowerCase().includes(q))
    );
    const factor = sort.direction === 'asc' ? 1 : -1;
    return filtered.sort((a, b) => {
      if (isSystemAdmin(a) !== isSystemAdmin(b)) return isSystemAdmin(a) ? -1 : 1;
      return compare(a, b, sort.key) * factor;
    });
  }, [users, query, role, status, sort]);

  const toggleSort = (key: string) => {
    const nextKey = key as UserSortKey;
    setSort((current) =>
    current.key === nextKey ?
    { key: nextKey, direction: current.direction === 'asc' ? 'desc' : 'asc' } :
    { key: nextKey, direction: nextKey === 'name' || nextKey === 'status' ? 'asc' : 'desc' }
    );
  };

  const hasFilters = query.trim() !== '' || role !== 'all' || status !== 'all';
  const clearFilters = () => {
    setQuery('');
    setRole('all');
    setStatus('all');
  };

  return { query, setQuery, role, setRole, status, setStatus, sort, toggleSort, visible, hasFilters, clearFilters };
}