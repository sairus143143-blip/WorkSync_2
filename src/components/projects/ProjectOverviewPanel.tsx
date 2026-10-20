import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheckIcon } from 'lucide-react';
import type { Project, ProjectActivity, ProjectRow } from '../../types/projects';
import { cn } from '../../utils/cn';
import {
  PROJECT_STATUSES,
  daysRemainingLabel,
  formatActivityTime,
  formatProjectDate,
  latestActivities,
  projectStatusLabels,
  summarizeProjects } from
'../../utils/projects';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { ProgressBar } from '../ui/ProgressBar';
import { ProjectActivityList } from './ProjectActivityList';
import { DeadlineBadge, ProjectStatusBadge, projectStatusMeta } from './ProjectBadges';

interface ProjectOverviewPanelProps {
  rows: ProjectRow[];
  projects: Project[];
  activities: ProjectActivity[];
  onViewAll: () => void;
}

function ProjectLink({ project }: {project: Project;}) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="block truncate rounded font-medium text-ink hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
      
      {project.name}
    </Link>);

}

export function ProjectOverviewPanel({ rows, projects, activities, onViewAll }: ProjectOverviewPanelProps) {
  const summary = summarizeProjects(projects);

  // Open projects by nearest deadline — overdue ones naturally come first.
  const deadlines = rows.
  filter((r) => r.deadlineState !== 'completed' && r.deadlineState !== 'cancelled').
  sort((a, b) => a.project.deadline.localeCompare(b.project.deadline)).
  slice(0, 6);
  const recentlyUpdated = [...projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4);
  const recentlyCompleted = projects.
  filter((p) => p.status === 'completed').
  sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).
  slice(0, 3);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card
        title="Upcoming deadlines"
        description="Open projects ordered by deadline"
        className="lg:col-span-2"
        bodyClassName="p-0 pt-3"
        action={
        <Button variant="ghost" size="sm" onClick={onViewAll}>
            View all projects
          </Button>
        }>
        
        {deadlines.length === 0 ?
        <EmptyState icon={CalendarCheckIcon} title="No open deadlines" description="Every project is completed or cancelled." /> :

        <ul className="divide-y divide-line border-t border-line">
            {deadlines.map((r) =>
          <li key={r.project.id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 px-5 py-3 sm:grid-cols-[minmax(0,1fr)_150px_110px_120px]">
                <div className="min-w-0">
                  <ProjectLink project={r.project} />
                  <p className="text-[13px] tabular-nums text-muted">
                    {r.project.code} · {r.department?.name ?? '—'}
                  </p>
                </div>
                <div className="text-right sm:text-left">
                  <p className="text-sm tabular-nums text-ink">{formatProjectDate(r.project.deadline, 'MMM d, yyyy')}</p>
                  <p className={cn('text-[13px] tabular-nums', r.deadlineState === 'overdue' ? 'text-danger' : r.deadlineState === 'due_soon' ? 'text-warning' : 'text-muted')}>
                    {daysRemainingLabel(r.daysRemaining)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:block">
                  <ProjectStatusBadge status={r.project.status} />
                </div>
                <div className="flex items-center gap-2">
                  <ProgressBar value={r.project.progress} tone={projectStatusMeta[r.project.status].bar} label={`${r.project.name} progress`} />
                  <span className="w-9 shrink-0 text-right text-[13px] font-medium tabular-nums">{r.project.progress}%</span>
                </div>
              </li>
          )}
          </ul>
        }
      </Card>

      <Card title="Status distribution" description={`${summary.total} projects in total`}>
        <ul className="space-y-4">
          {PROJECT_STATUSES.map((status) => {
            const count = summary.byStatus[status];
            const Icon = projectStatusMeta[status].icon;
            return (
              <li key={status}>
                <div className="mb-1.5 flex items-center justify-between text-[13px]">
                  <span className="inline-flex items-center gap-1.5 text-muted">
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    {projectStatusLabels[status]}
                  </span>
                  <span className="font-medium tabular-nums text-ink">{count}</span>
                </div>
                <ProgressBar value={count} max={Math.max(1, summary.total)} tone={projectStatusMeta[status].bar} label={`${projectStatusLabels[status]} projects`} />
              </li>);

          })}
        </ul>
      </Card>

      <Card title="Recent project activity" className="lg:col-span-2">
        <ProjectActivityList activities={latestActivities(activities, 7)} projects={projects} />
      </Card>

      <div className="flex flex-col gap-6">
        <Card title="Recently updated">
          <ul className="space-y-3">
            {recentlyUpdated.map((p) =>
            <li key={p.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <ProjectLink project={p} />
                  <p className="text-xs text-muted">{formatActivityTime(p.updatedAt)}</p>
                </div>
                <ProjectStatusBadge status={p.status} />
              </li>
            )}
          </ul>
        </Card>
        <Card title="Recently completed">
          {recentlyCompleted.length === 0 ?
          <p className="text-sm text-muted">No completed projects yet.</p> :

          <ul className="space-y-3">
              {recentlyCompleted.map((p) =>
            <li key={p.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <ProjectLink project={p} />
                    <p className="text-xs text-muted">Completed {formatProjectDate(p.updatedAt.slice(0, 10), 'MMM d, yyyy')}</p>
                  </div>
                  <DeadlineBadge state="completed" />
                </li>
            )}
            </ul>
          }
        </Card>
      </div>
    </div>);

}