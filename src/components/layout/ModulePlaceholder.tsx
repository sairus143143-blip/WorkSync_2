import React from 'react';
import type { ModuleInfo } from '../../types/modules';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { PageHeader } from '../ui/PageHeader';

/** Shared shell for modules that are routed but not yet built. */
export function ModulePlaceholder({ module }: {module: ModuleInfo;}) {
  return (
    <div className="space-y-6">
      <PageHeader title={module.title} description={module.description} actions={<Badge>Planned module</Badge>} />
      <Card bodyClassName="p-0">
        <EmptyState
          icon={module.icon}
          title={`${module.title} is coming in a later phase`}
          description="This page is in place so navigation works end to end. The module itself will be built in an upcoming phase."
          className="py-14" />
        
        <div className="border-t border-line px-6 py-6">
          <h2 className="text-sm font-semibold text-ink">What this module will include</h2>
          <ul className="mt-4 grid gap-x-10 gap-y-3 sm:grid-cols-2">
            {module.capabilities.map((capability) =>
            <li key={capability} className="flex gap-3 text-sm text-muted">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" aria-hidden />
                {capability}
              </li>
            )}
          </ul>
        </div>
      </Card>
    </div>);

}