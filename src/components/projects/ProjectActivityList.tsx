import React from "react";
import { Link } from "react-router-dom";
import { CirclePlusIcon, FlagIcon, PencilIcon, TrendingUpIcon, UserMinusIcon, UserPlusIcon, BoxIcon } from "lucide-react";
import { Project, ProjectActivity, ProjectActivityAction } from "../../types/projects";
import { formatActivityTime } from "../../utils/projects";
const actionIcon: Record<ProjectActivityAction, BoxIcon> = {
  project_created: CirclePlusIcon,
  project_updated: PencilIcon,
  status_changed: FlagIcon,
  progress_updated: TrendingUpIcon,
  member_added: UserPlusIcon,
  member_removed: UserMinusIcon
};
interface ProjectActivityListProps {
  activities: ProjectActivity[];
  /** When provided, each entry links to its project (used on the overview). */
  projects?: Project[];
  emptyMessage?: string;
}

/** Most recent first. Activities are passed in already sliced. */
export function ProjectActivityList({
  activities,
  projects,
  emptyMessage = 'No activity yet.'
}: ProjectActivityListProps) {
  if (activities.length === 0) return <p className="py-6 text-center text-sm text-muted">{emptyMessage}</p>;
  return <ol className="space-y-4">
      {activities.map((a) => {
      const Icon = actionIcon[a.action];
      const project = projects?.find((p) => p.id === a.projectId);
      return <li key={a.id} className="flex gap-3">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink/[0.05] text-muted" aria-hidden>
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-ink">{a.description}</p>
              <p className="mt-0.5 text-xs text-muted">
                {project && <>
                    <Link to={`/projects/${project.id}`} className="font-medium text-ink hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                      {project.name}
                    </Link>
                    {' · '}
                  </>}
                <time dateTime={a.createdAt}>{formatActivityTime(a.createdAt)}</time>
              </p>
            </div>
          </li>;
    })}
    </ol>;
}