import React from 'react';
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  align?: 'left' | 'right';
  hideBelow?: 'sm' | 'md' | 'lg';
  className?: string;
  /** When set, the header becomes a sort button for this key. */
  sortKey?: string;
}

export interface TableSort {
  key: string;
  direction: 'asc' | 'desc';
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  caption?: string;
  emptyMessage?: string;
  sort?: TableSort;
  onSort?: (key: string) => void;
  getRowClassName?: (row: T) => string | undefined;
}

const hideClass = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell'
};

export function Table<T>({
  columns,
  rows,
  getRowKey,
  caption,
  emptyMessage = 'Nothing to show yet.',
  sort,
  onSort,
  getRowClassName
}: TableProps<T>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="bg-bg/70">
            {columns.map((col) => {
              const sortable = Boolean(col.sortKey && onSort);
              const active = sortable && sort?.key === col.sortKey;
              const SortIcon = !active ? ChevronsUpDownIcon : sort?.direction === 'asc' ? ArrowUpIcon : ArrowDownIcon;
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={active ? sort?.direction === 'asc' ? 'ascending' : 'descending' : undefined}
                  className={cn(
                    'whitespace-nowrap px-4 py-2.5 text-xs font-medium text-muted first:pl-5 last:pr-5',
                    col.align === 'right' ? 'text-right' : 'text-left',
                    col.hideBelow && hideClass[col.hideBelow]
                  )}>
                  
                  {sortable ?
                  <button
                    type="button"
                    onClick={() => col.sortKey && onSort?.(col.sortKey)}
                    className={cn(
                      '-mx-1 inline-flex items-center gap-1 rounded px-1 transition-colors duration-150 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                      active && 'text-ink'
                    )}>
                    
                      {col.header}
                      <SortIcon className={cn('h-3.5 w-3.5', !active && 'text-subtle')} aria-hidden />
                    </button> :

                  col.header
                  }
                </th>);

            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ?
          <tr>
              <td colSpan={columns.length} className="px-5 py-12 text-center text-sm text-muted">
                {emptyMessage}
              </td>
            </tr> :

          rows.map((row) =>
          <tr key={getRowKey(row)} className={cn('border-t border-line', getRowClassName?.(row))}>
                {columns.map((col) =>
            <td
              key={col.key}
              className={cn(
                'px-4 py-3 align-middle text-ink first:pl-5 last:pr-5',
                col.align === 'right' ? 'text-right' : 'text-left',
                col.hideBelow && hideClass[col.hideBelow],
                col.className
              )}>
              
                    {col.render(row)}
                  </td>
            )}
              </tr>
          )
          }
        </tbody>
      </table>
    </div>);

}