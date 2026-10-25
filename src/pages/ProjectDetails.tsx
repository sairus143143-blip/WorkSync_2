import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, CloudOffIcon, FlagIcon, FolderSearchIcon, PencilIcon } from 'lucide-react';
import { AddMembersModal } from '../components/projects/AddMembersModal';
import { ProjectActivityList } from '../components/projects/ProjectActivityList';
import { DeadlineBadge, ProjectStatusBadge, projectStatusMeta } from '../components/projects/ProjectBadges';
import { ProjectMembersCard } from '../components/projects/ProjectMembersCard';
import { ProjectDetailsLoading } from '../components/projects/ProjectsLoading';
import { useProjectActions } from '../components/projects/useProjectActions';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useEmployees } from '../contexts/EmployeesContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { useProjects } from '../contexts/ProjectsContext';
import { useToast } from '../contexts/ToastContext';
import { useUsers } from '../contexts/UsersContext';
import { useSimulatedLoad } from '../hooks/useSimulatedLoad';
import type { ProjectMember } from '../types/projects';
import { cn } from '../utils/cn';
import {
  activeMembersOf,
  daysRemainingLabel,
  daysUntil,
  deadlineState,
  formatActivityTime,
  formatProjectDate,
  latestActivities,
  memberSummary } from
'../utils/projects';

interface ProjectDetailsProps {
  simulateLoadError?: boolean;
}

function Field({ label, children }: {label: string;children: React.ReactNode;}) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink">{children}</dd>
    </div>);

}

export function ProjectDetails({ simulateLoadError = false }: ProjectDetailsProps) {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { projects, members, activities, addMembers, removeMember } = useProjects();
  const { employees } = useEmployees();
  const { positions } = useOrganization();
  const { users } = useUsers();
  const { toast } = useToast();
  const { state: loadState, retry } = useSimulatedLoad(simulateLoadError);
  const actions = useProjectActions();

  const [addOpen, setAddOpen] = useState(false);
  const [removing, setRemoving] = useState<{member: ProjectMember;name: string;} | null>(null);
  const membersRef = useRef<HTMLDivElement>(null);

  const project = projects.find((p) => p.id === projectId);
  const projectMembers = useMemo(() => project ? activeMembersOf(members, project.id) : [], [members, project]);
  const memberIds = useMemo(() => new Set(projectMembers.map((m) => m.employeeId)), [projectMembers]);

  // "Manage Members" from the list lands here and scrolls to the team.
  const focusMembers = (location.state as {focus?: string;} | null)?.focus === 'members';
  useEffect(() => {
    if (loadState === 'ready' && focusMembers) membersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [loadState, focusMembers]);

  const back =
  <Link
    to="/projects?view=all"
    className="inline-flex items-center gap-1.5 rounded text-[13px] font-medium text-muted transition-colors duration-150 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
    
      <ArrowLeftIcon className="h-4 w-4" aria-hidden />
      All projects
    </Link>;


  if (loadState === 'loading') return <ProjectDetailsLoading />;
  if (loadState === 'error') {
    return (
      <div className="space-y-4">
        {back}
        <Card>
          <EmptyState
            icon={CloudOffIcon}
            title="Unable to load this project."
            description="Something went wrong while loading the project. Please try again."
            action={<Button onClick={retry}>Try Again</Button>}
            className="py-16" />
          
        </Card>
      </div>);

  }
  if (!project) {
    return (
      <div className="space-y-4">
        {back}
        <Card>
          <EmptyState
            icon={FolderSearchIcon}
            title="Project not found"
            description="This project doesn’t exist or the link is incorrect."
            action={<Button onClick={() => navigate('/projects?view=all')}>Back to projects</Button>}
            className="py-16" />
          
        </Card>
      </div>);

  }

  const creator = users.find((u) => u.id === project.createdBy);
  const state = deadlineState(project);
  const days = daysUntil(project.deadline);
  const summary = memberSummary(members, employees, project.id);

  const submitMembers = (ids: string[]) => {
    addMembers(project.id, ids);
    setAddOpen(false);
    toast({ title: 'Project members added successfully.' });
  };

  const confirmRemove = () => {
    if (!removing) return;
    removeMember(removing.member.id);
    setRemoving(null);
    toast({ title: 'Employee removed from project.', description: removing.name });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {back}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">{project.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-muted">
              <span className="tabular-nums">{project.code}</span>
              <ProjectStatusBadge status={project.status} />
              <DeadlineBadge state={state} />
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button variant="secondary" leftIcon={<FlagIcon className="h-4 w-4" />} onClick={() => actions.openStatus(project)}>
              Change Status
            </Button>
            <Button leftIcon={<PencilIcon className="h-4 w-4" />} onClick={() => actions.openEdit(project)}>
              Edit Project
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Project overview">
            <p className="text-sm leading-relaxed text-ink">{project.description || <span className="text-muted">No description provided.</span>}</p>

            <div className="mt-5 rounded-lg bg-bg px-4 py-3">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-[13px] text-muted">Progress</span>
                <span className="text-xl font-semibold tabular-nums text-ink">{project.progress}%</span>
              </div>
              <ProgressBar value={project.progress} size="md" tone={projectStatusMeta[project.status].bar} label="Project progress" />
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
              <Field label="Start date">{formatProjectDate(project.startDate)}</Field>
              <Field label="Deadline">
                {formatProjectDate(project.deadline)}
                {state !== 'completed' && state !== 'cancelled' &&
                <span className={cn('block text-xs', state === 'overdue' ? 'text-danger' : state === 'due_soon' ? 'text-warning' : 'text-muted')}>
                    {daysRemainingLabel(days)}
                  </span>
                }
              </Field>
              <Field label="Created by">{creator ? `${creator.firstName} ${creator.lastName}` : 'System Administrator'}</Field>
              <Field label="Created">{formatActivityTime(project.createdAt)}</Field>
              <Field label="Last updated">{formatActivityTime(project.updatedAt)}</Field>
            </dl>
          </Card>

          <ProjectMembersCard
            ref={membersRef}
            members={projectMembers}
            employees={employees}
            positions={positions}
            summary={summary}
            onAdd={() => setAddOpen(true)}
            onRemove={(member, name) => setRemoving({ member, name })} />
          
        </div>

        <Card title="Recent activity" className="self-start">
          <ProjectActivityList activities={latestActivities(activities, 10, project.id)} />
        </Card>
      </div>

      <AddMembersModal
        open={addOpen}
        projectName={project.name}
        employees={employees}
        positions={positions}
        currentMemberIds={memberIds}
        onClose={() => setAddOpen(false)}
        onSubmit={submitMembers} />
      
      <ConfirmDialog
        request={
        removing ?
        {
          title: 'Remove Project Member?',
          message: 'Are you sure you want to remove this employee from the project?',
          confirmLabel: 'Remove',
          tone: 'danger',
          details:
          <p className="text-[13px] text-muted">
                    {removing.name} will be removed from {project.name}. Their employee record isn’t affected.
                  </p>

        } :
        null
        }
        onClose={() => setRemoving(null)}
        onConfirm={confirmRemove} />
      
      {actions.dialogs}
    </div>);

}