import React from 'react';
import { CalendarClockIcon, CircleCheckIcon, FolderKanbanIcon, FolderOpenIcon, TriangleAlertIcon } from 'lucide-react';
import type { Project } from '../../types/projects';
import { DUE_SOON_DAYS, summarizeProjects } from '../../utils/projects';
import { StatCard } from '../ui/StatCard';

/** Summary cards — every value is derived from the project list. */
export function ProjectSummary({ projects }: {projects: Project[];}) {
  const s = summarizeProjects(projects);
  return (
    <section aria-label="Project summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <StatCard label="Total Projects" value={String(s.total)} icon={FolderOpenIcon} tone="neutral" hint="All projects" />
      <StatCard label="Active Projects" value={String(s.active)} icon={FolderKanbanIcon} tone="primary" featured hint="Currently in progress" />
      <StatCard label="Completed Projects" value={String(s.completed)} icon={CircleCheckIcon} tone="success" hint="Successfully completed" />
      <StatCard
        label="Upcoming Deadlines"
        value={String(s.dueSoon)}
        icon={CalendarClockIcon}
        tone={s.dueSoon > 0 ? 'warning' : 'neutral'}
        hint={`Due within ${DUE_SOON_DAYS} days`} />
      
      <StatCard
        label="Overdue Projects"
        value={String(s.overdue)}
        icon={TriangleAlertIcon}
        tone={s.overdue > 0 ? 'danger' : 'neutral'}
        hint={s.overdue > 0 ? 'Requires attention' : 'Nothing overdue'} />
      
    </section>);

}