import { useMemo, useState } from 'react';
import type { EmployeeSort, EmployeeSortKey, EmployeeView, EmploymentStatusFilter } from '../types/employees';

const statusOrder = { active: 0, on_leave: 1, inactive: 2 };

function compare(a: EmployeeView, b: EmployeeView, key: EmployeeSortKey): number {
  switch (key) {
    case 'name':
      return a.fullName.localeCompare(b.fullName);
    case 'employeeNumber':
      return a.employee.employeeNumber.localeCompare(b.employee.employeeNumber);
    case 'position':
      return (a.position?.name ?? '').localeCompare(b.position?.name ?? '');
    case 'dateHired':
      return a.employee.dateHired.localeCompare(b.employee.dateHired);
    case 'status':
      return statusOrder[a.employee.employmentStatus] - statusOrder[b.employee.employmentStatus];
  }
}

/** Search, filters (by structured IDs) and sorting for the employee table. */
export function useEmployeeDirectory(views: EmployeeView[]) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<EmploymentStatusFilter>('all');
  const [positionId, setPositionId] = useState('all');
  const [sort, setSort] = useState<EmployeeSort>({ key: 'employeeNumber', direction: 'asc' });

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = views.filter((v) => {
      const haystack = [v.fullName, v.employee.employeeNumber, v.user?.email ?? '', v.position?.name ?? ''].
      join(' ').
      toLowerCase();
      return (
        (status === 'all' || v.employee.employmentStatus === status) && (
        positionId === 'all' || v.employee.positionId === positionId) && (
        !q || haystack.includes(q)));

    });
    const factor = sort.direction === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => compare(a, b, sort.key) * factor);
  }, [views, query, status, positionId, sort]);

  const toggleSort = (key: string) => {
    const nextKey = key as EmployeeSortKey;
    setSort((current) =>
    current.key === nextKey ?
    { key: nextKey, direction: current.direction === 'asc' ? 'desc' : 'asc' } :
    { key: nextKey, direction: nextKey === 'dateHired' ? 'desc' : 'asc' }
    );
  };

  const hasFilters = query.trim() !== '' || status !== 'all' || positionId !== 'all';
  const clearFilters = () => {
    setQuery('');
    setStatus('all');
    setPositionId('all');
  };

  return {
    query,
    setQuery,
    status,
    setStatus,
    positionId,
    setPositionId,
    sort,
    toggleSort,
    visible,
    hasFilters,
    clearFilters
  };
}