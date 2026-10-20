import React from "react";
import { BanIcon, CalendarClockIcon, CalendarIcon, CircleCheckIcon, CirclePauseIcon, CirclePlayIcon, CircleXIcon, ClipboardListIcon, MinusIcon, TriangleAlertIcon, BoxIcon } from "lucide-react";
import { DeadlineState, ProjectStatus } from "../../types/projects";
import { BadgeTone, ProgressTone } from "../../types/ui";
import { deadlineStateLabels, projectStatusLabels } from "../../utils/projects";
import { Badge } from "../ui/Badge";
export const projectStatusMeta: Record<ProjectStatus, {
  tone: BadgeTone;
  icon: BoxIcon;
  bar: ProgressTone;
}> = {
  planning: {
    tone: 'info',
    icon: ClipboardListIcon,
    bar: 'primary'
  },
  active: {
    tone: 'primary',
    icon: CirclePlayIcon,
    bar: 'primary'
  },
  on_hold: {
    tone: 'warning',
    icon: CirclePauseIcon,
    bar: 'warning'
  },
  completed: {
    tone: 'success',
    icon: CircleCheckIcon,
    bar: 'success'
  },
  cancelled: {
    tone: 'neutral',
    icon: BanIcon,
    bar: 'danger'
  }
};
const deadlineMeta: Record<DeadlineState, {
  tone: BadgeTone;
  icon: BoxIcon;
}> = {
  upcoming: {
    tone: 'neutral',
    icon: CalendarIcon
  },
  due_soon: {
    tone: 'warning',
    icon: CalendarClockIcon
  },
  overdue: {
    tone: 'danger',
    icon: TriangleAlertIcon
  },
  completed: {
    tone: 'success',
    icon: CircleCheckIcon
  },
  cancelled: {
    tone: 'neutral',
    icon: MinusIcon
  }
};

/** Status with icon + text, so meaning never depends on color alone. */
export function ProjectStatusBadge({
  status


}: {status: ProjectStatus;}) {
  const {
    tone,
    icon: Icon
  } = projectStatusMeta[status];
  return <Badge tone={tone}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {projectStatusLabels[status]}
    </Badge>;
}

/** Deadline condition — separate from the project status. */
export function DeadlineBadge({
  state


}: {state: DeadlineState;}) {
  if (state === 'cancelled') return <Badge tone="neutral"><CircleXIcon className="h-3.5 w-3.5" aria-hidden />No deadline</Badge>;
  const {
    tone,
    icon: Icon
  } = deadlineMeta[state];
  return <Badge tone={tone}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {deadlineStateLabels[state]}
    </Badge>;
}