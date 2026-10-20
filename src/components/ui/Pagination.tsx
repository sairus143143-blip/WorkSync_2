import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  /** e.g. "projects" */
  noun: string;
  onPageChange: (page: number) => void;
}

/** "Showing 1–10 of 24" with Previous / page numbers / Next. Controls hide when one page is enough. */
export function Pagination({ page, pageSize, total, noun, onPageChange }: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  return (
    <div className="flex flex-col items-center gap-3 border-t border-line px-5 py-3 sm:flex-row sm:justify-between">
      <p className="text-[13px] text-muted" aria-live="polite">
        Showing <span className="tabular-nums">{start}–{end}</span> of <span className="tabular-nums">{total}</span> {noun}
      </p>
      {pageCount > 1 &&
      <nav aria-label="Pagination" className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => onPageChange(page - 1)} disabled={page === 1} leftIcon={<ChevronLeftIcon className="h-4 w-4" />}>
            Previous
          </Button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) =>
        <button
          key={n}
          type="button"
          onClick={() => onPageChange(n)}
          aria-current={n === page ? 'page' : undefined}
          aria-label={`Page ${n}`}
          className={cn(
            'h-8 min-w-[2rem] rounded-lg px-2 text-[13px] font-medium tabular-nums transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
            n === page ? 'bg-primary-soft text-primary' : 'text-muted hover:bg-ink/5 hover:text-ink'
          )}>
          
              {n}
            </button>
        )}
          <Button variant="ghost" size="sm" onClick={() => onPageChange(page + 1)} disabled={page === pageCount}>
            Next
            <ChevronRightIcon className="h-4 w-4" aria-hidden />
          </Button>
        </nav>
      }
    </div>);

}