import React from 'react';
import { Card } from '../ui/Card';
import { LoadingState } from '../ui/LoadingState';

function Bar({ className }: {className: string;}) {
  return <div className={`animate-pulse rounded bg-ink/[0.07] ${className}`} />;
}

/** Skeleton summary cards + table for the project list. */
export function ProjectsListLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <span className="sr-only">Loading projects…</span>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) =>
        <div key={i} className="rounded-xl border border-line bg-surface p-5 shadow-card">
            <Bar className="h-3 w-24" />
            <Bar className="mt-4 h-7 w-12" />
            <Bar className="mt-4 h-3 w-28" />
          </div>
        )}
      </div>
      <Card bodyClassName="p-0">
        <LoadingState variant="table" rows={6} columns={5} label="Loading projects…" />
      </Card>
    </div>);

}

/** Skeleton sections for the project details page. */
export function ProjectDetailsLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <span className="sr-only">Loading project…</span>
      <div className="space-y-3">
        <Bar className="h-3 w-24" />
        <Bar className="h-7 w-72" />
        <Bar className="h-3 w-40" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <div className="space-y-4">
              <Bar className="h-3 w-full" />
              <Bar className="h-3 w-4/5" />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {Array.from({ length: 6 }, (_, i) =>
                <div key={i} className="space-y-2">
                    <Bar className="h-2.5 w-16" />
                    <Bar className="h-3 w-24" />
                  </div>
                )}
              </div>
            </div>
          </Card>
          <Card bodyClassName="p-0">
            <LoadingState variant="table" rows={4} columns={3} label="Loading members…" />
          </Card>
        </div>
        <Card>
          <LoadingState variant="skeleton" rows={5} label="Loading activity…" />
        </Card>
      </div>
    </div>);

}