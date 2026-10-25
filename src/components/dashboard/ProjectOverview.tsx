import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import type { ProjectStatus } from '../../types/dashboard';
import type { BadgeTone, ProgressTone } from '../../types/ui';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { useProjects } from '../../contexts/ProjectsContext';
import { useEmployees } from '../../contexts/EmployeesContext';
import { employeeFullName } from '../../utils/employees';

const badgeTone: Record<ProjectStatus, BadgeTone> = {
  'On track': 'success',
  'At risk': 'warning',
  Delayed: 'danger',
  Completed: 'neutral'
};
const barTone: Record<ProjectStatus, ProgressTone> = {
  'On track': 'primary',
  'At risk': 'warning',
  Delayed: 'danger',
  Completed: 'success'
};

export function ProjectOverview({ className }: {className?: string;}) {
  const { projects, members } = useProjects();
  const { employees } = useEmployees();
  const projectsForDisplay = projects.filter((project) => project.status === 'active').slice(0, 4).map((project) => {
    const leadMember = members.find((member) => member.projectId === project.id && member.status === 'active');
    const lead = leadMember ? employees.find((employee) => employee.id === leadMember.employeeId) : undefined;
    const teamSize = members.filter((member) => member.projectId === project.id && member.status === 'active').length;
    const status: ProjectStatus = project.status === 'active' ? 'On track' : project.status === 'completed' ? 'Completed' : project.status === 'on_hold' ? 'At risk' : 'Delayed';
    const deadlineDate = new Date(`${project.deadline}T00:00:00`);
    return { ...project, displayStatus: status, teamSize, leadName: lead ? employeeFullName(lead) : 'Lead unassigned', deadlineLabel: Number.isNaN(deadlineDate.getTime()) ? '—' : deadlineDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) };
  });
  return (
    <Card
      title="Project overview"
      description="Progress on active projects"
      className={className}
      action={
      <Link
        to="/projects"
        className="inline-flex items-center gap-1 rounded text-[13px] font-medium text-primary hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
        
          All projects <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
        </Link>
      }>
      
      <ul className="divide-y divide-line">
        {projectsForDisplay.map((project) =>
        <li key={project.id} className="grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_200px_120px] sm:items-center sm:gap-6">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-ink">{project.name}</p>
                <Badge tone={badgeTone[project.displayStatus]} className="sm:hidden">
                  {project.displayStatus}
                </Badge>
              </div>
              <p className="mt-0.5 truncate text-[13px] text-muted">
                {project.teamSize} {project.teamSize === 1 ? 'employee' : 'employees'} assigned · Led by {project.leadName}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ProgressBar value={project.progress} tone={barTone[project.displayStatus]} label={`${project.name} progress`} />
              <span className="w-10 shrink-0 text-right text-sm font-semibold tabular-nums text-ink">{project.progress}%</span>
            </div>
            <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
              <Badge tone={badgeTone[project.displayStatus]} className="hidden sm:inline-flex">
                {project.displayStatus}
              </Badge>
              <p className="text-[13px] tabular-nums text-ink sm:mt-1">
                {project.deadlineLabel}
              </p>
            </div>
          </li>
        )}
      </ul>
    </Card>);

}
