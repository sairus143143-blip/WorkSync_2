import React from 'react';
import { useNavigate } from 'react-router-dom';
import { quickActions } from '../../data/dashboard';

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <section aria-labelledby="quick-actions-heading">
      <h2 id="quick-actions-heading" className="sr-only">
        Quick actions
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {quickActions.map((action) =>
        <li key={action.id}>
            <button
            type="button"
            onClick={() => navigate(action.path)}
            className="flex w-full items-center gap-3 rounded-xl border border-line bg-surface p-3 text-left shadow-card transition-[border-color,background-color,transform] duration-150 ease-out hover:border-primary/40 hover:bg-primary-soft/40 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
            
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary" aria-hidden>
                <action.icon className="h-[18px] w-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-ink">{action.label}</span>
                <span className="block truncate text-xs text-muted">Go to {action.description}</span>
              </span>
            </button>
          </li>
        )}
      </ul>
    </section>);

}