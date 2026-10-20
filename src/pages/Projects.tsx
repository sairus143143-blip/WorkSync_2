import React, { useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CloudOffIcon, PlusIcon } from 'lucide-react';
import { ProjectListPanel } from '../components/projects/ProjectListPanel';
import { ProjectOverviewPanel } from '../components/projects/ProjectOverviewPanel';
import { ProjectSummary } from '../components/projects/ProjectSummary';
import { ProjectsListLoading } from '../components/projects/ProjectsLoading';
import { useProjectActions } from '../components/projects/useProjectActions';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { Tabs, tabPanelProps } from '../components/ui/Tabs';
import { useOrganization } from '../contexts/OrganizationContext';
import { useProjects } from '../contexts/ProjectsContext';
import { useUsers } from '../contexts/UsersContext';
import { useSimulatedLoad } from '../hooks/useSimulatedLoad';
import type { ProjectRow } from '../types/projects';
import { buildProjectRows } from '../utils/projects';

interface ProjectsProps {
  /** Prototype control: first load fails so the error state can be reviewed. */
  simulateLoadError?: boolean;
}

type ProjectsView = 'overview' | 'all';

export function Projects({ simulateLoadError = false }: ProjectsProps) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const view: ProjectsView = params.get('view') === 'all' ? 'all' : 'overview';
  const setView = (next: ProjectsView) => setParams(next === 'all' ? { view: 'all' } : {}, { replace: true });

  const { projects, members, activities } = useProjects();
  const { departments } = useOrganization();
  const { users } = useUsers();
  const { state: loadState, retry } = useSimulatedLoad(simulateLoadError);
  const actions = useProjectActions({ onCreated: (p) => navigate(`/projects/${p.id}`) });

  const rows = useMemo(() => buildProjectRows(projects, departments, members), [projects, departments, members]);
  const leadName = useCallback(
    (createdBy: string) => {
      const u = users.find((x) => x.id === createdBy);
      return u ? `${u.firstName} ${u.lastName}` : 'System Administrator';
    },
    [users]
  );

  const openProject = (r: ProjectRow) => navigate(`/projects/${r.project.id}`);
  const manageMembers = (r: ProjectRow) => navigate(`/projects/${r.project.id}`, { state: { focus: 'members' } });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Management"
        description="Create, manage, assign, and monitor organizational projects."
        actions={
        <Button leftIcon={<PlusIcon className="h-4 w-4" />} onClick={actions.openCreate}>
            Create Project
          </Button>
        } />
      

      {loadState === 'error' ?
      <Card>
          <EmptyState
          icon={CloudOffIcon}
          title="Unable to load projects."
          description="Something went wrong while loading projects. Please try again."
          action={<Button onClick={retry}>Try Again</Button>}
          className="py-16" />
        
        </Card> :
      loadState === 'loading' ?
      <ProjectsListLoading /> :

      <>
          <ProjectSummary projects={projects} />
          <div>
            <Tabs
            label="Project views"
            idPrefix="projects"
            value={view}
            onChange={setView}
            items={[
            { value: 'overview', label: 'Overview' },
            { value: 'all', label: 'All Projects', count: projects.length }]
            } />
          
            <div className="pt-5" {...tabPanelProps('projects', view)}>
              {view === 'overview' ?
            <ProjectOverviewPanel rows={rows} projects={projects} activities={activities} onViewAll={() => setView('all')} /> :

            <ProjectListPanel
              rows={rows}
              departments={departments}
              leadName={leadName}
              onCreate={actions.openCreate}
              onView={openProject}
              onEdit={(r) => actions.openEdit(r.project)}
              onManageMembers={manageMembers}
              onChangeStatus={(r) => actions.openStatus(r.project)} />

            }
            </div>
          </div>
        </>
      }

      {actions.dialogs}
    </div>);

}