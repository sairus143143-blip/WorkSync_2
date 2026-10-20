import React from 'react';
import { Card } from '../ui/Card';
import { LoadingState } from '../ui/LoadingState';
import { StatCard } from '../ui/StatCard';

export function TasksSummaryLoading() {
  return (
    <section aria-label="Task summary loading" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {Array.from({ length: 7 }).map((_, i) =>
        <StatCard key={i} label="Loading" value="—" className="animate-pulse" />
      )}
    </section>
  );
}

export function TasksListLoading() {
  return (
    <Card bodyClassName="p-0">
      <LoadingState variant="table" rows={10} columns={8} label="Loading tasks…" />
    </Card>
  );
}

export function TaskDetailsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded bg-ink/10" />
      <Card>
        <LoadingState variant="detail" label="Loading task details…" />
      </Card>
    </div>
  );
}
