import { useMemo, useState } from 'react';
import type { SortState } from '../types/organization';

interface Options<T, K extends string> {
  rows: T[];
  /** Text the search query is matched against. */
  searchText: (row: T) => string;
  /** Caller-owned filters such as status. */
  matches?: (row: T) => boolean;
  compare: (a: T, b: T, key: K) => number;
  initialSort: SortState<K>;
  /** Keys that start descending when first selected (e.g. counts). */
  descFirst?: K[];
}

/** Search + sort for management tables. Filters stay with the page so each table can define its own. */
export function useTableDirectory<T, K extends string>({ rows, searchText, matches, compare, initialSort, descFirst = [] }: Options<T, K>) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortState<K>>(initialSort);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = rows.filter((row) => (!matches || matches(row)) && (!q || searchText(row).toLowerCase().includes(q)));
    const factor = sort.direction === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => compare(a, b, sort.key) * factor);
  }, [rows, query, sort, matches, searchText, compare]);

  const toggleSort = (key: string) => {
    const nextKey = key as K;
    setSort((current) =>
    current.key === nextKey ?
    { key: nextKey, direction: current.direction === 'asc' ? 'desc' : 'asc' } :
    { key: nextKey, direction: descFirst.includes(nextKey) ? 'desc' : 'asc' }
    );
  };

  return { query, setQuery, sort, toggleSort, visible };
}