import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CloudOffIcon, LayoutGridIcon, ListIcon, PlusIcon, SearchXIcon } from 'lucide-react';
import { TaskBoard } from '../components/tasks/TaskBoard';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { TaskSummary } from '../components/tasks/TaskSummary';
import { TaskTable } from '../components/tasks/TaskTable';
import { TasksListLoading, TasksSummaryLoading } from '../components/tasks/TasksLoading';
import { useTaskActions } from '../components/tasks/useTaskActions';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { Pagination } from '../components/ui/Pagination';
import { Tabs, tabPanelProps } from '../components/ui/Tabs';
import { useEmployees } from '../contexts/EmployeesContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { useProjects } from '../contexts/ProjectsContext';
import { useTasks } from '../contexts/TasksContext';
import { useTaskDirectory } from '../hooks/useTaskDirectory';
import { useSimulatedLoad } from '../hooks/useSimulatedLoad';
import { buildTaskRows } from '../utils/tasks';

type TaskView = 'list' | 'board';

interface TasksProps {
  simulateLoadError?: boolean;
}

const PAGE_SIZE = 10;

export function Tasks({ simulateLoadError = false }: TasksProps) {
  const [params, setParams] = useSearchParams();
  const view: TaskView = params.get('view') === 'board' ? 'board' : 'list';
  const setView = (next: TaskView) => {
    const nextParams = new URLSearchParams(params);
    if (next === 'board') nextParams.set('view', 'board');else nextParams.delete('view');
    setParams(nextParams, { replace: true });
  };

  const { tasks } = useTasks();
  const { projects, members } = useProjects();
  const { employees } = useEmployees();
  const { departments, positions } = useOrganization();
  const { state: loadState, retry } = useSimulatedLoad(simulateLoadError);
  const actions = useTaskActions();

  const rows = useMemo(
    () => buildTaskRows(tasks, projects, employees, departments, positions),
    [tasks, projects, employees, departments, positions]
  );
  const directory = useTaskDirectory({ rows });
  const [page, setPage] = useState(1);

  const projectFromUrl = params.get('project');
  useEffect(() => {
    if (projectFromUrl) directory.setProjectId(projectFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectFromUrl]);

  useEffect(() => {
    setPage(1);
  }, [directory.visible.length, directory.query, directory.status, directory.priority, directory.projectId]);

  const paged = view === 'list' ? directory.visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : directory.visible;
  const zeroTasks = tasks.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Task Management"
        description="Create, assign, organize, and monitor employee tasks."
        actions={
          <Button leftIcon={<PlusIcon className="h-4 w-4" />} onClick={actions.openCreate}>
            Create Task
          </Button>
        } />

      {loadState === 'error' ?
        <Card>
          <EmptyState
            icon={CloudOffIcon}
            title="Unable to load task data."
            description="Something went wrong while loading tasks. Please try again."
            action={<Button onClick={retry}>Try Again</Button>}
            className="py-16" />
        </Card> :
        loadState === 'loading' ?
          <>
            <TasksSummaryLoading />
            <TasksListLoading />
          </> :

          <>
            <TaskSummary tasks={tasks} />

            <div>
              <Tabs
                label="Task views"
                idPrefix="tasks"
                value={view}
                onChange={setView}
                items={[
                  { value: 'list', label: 'List View', icon: ListIcon },
                  { value: 'board', label: 'Board View', icon: LayoutGridIcon }
                ]} />

              <div className="pt-5" {...tabPanelProps('tasks', view)}>
                <Card bodyClassName="p-0">
                  <TaskFilters
                    query={directory.query}
                    onQueryChange={directory.setQuery}
                    status={directory.status}
                    onStatusChange={directory.setStatus}
                    priority={directory.priority}
                    onPriorityChange={directory.setPriority}
                    projectId={directory.projectId}
                    onProjectChange={directory.setProjectId}
                    employeeId={directory.employeeId}
                    onEmployeeChange={directory.setEmployeeId}
                    departmentId={directory.departmentId}
                    onDepartmentChange={directory.setDepartmentId}
                    deadline={directory.deadline}
                    onDeadlineChange={directory.setDeadline}
                    projects={projects}
                    employees={employees}
                    departments={departments}
                    hasFilters={directory.hasFilters}
                    onClear={directory.clearFilters}
                    resultCount={directory.visible.length} />

                  {directory.visible.length === 0 ?
                    <EmptyState
                      icon={SearchXIcon}
                      title="No tasks found"
                      description={zeroTasks ? 'Create the first task for your projects.' : 'There are no tasks matching your current filters.'}
                      action={
                        zeroTasks ?
                          <Button onClick={actions.openCreate}>Create First Task</Button> :
                          <Button variant="secondary" onClick={directory.clearFilters}>Clear Filters</Button>
                      }
                      className="py-16" /> :

                    view === 'list' ?
                      <>
                        <TaskTable
                          rows={paged}
                          sort={directory.sort}
                          onSort={directory.toggleSort}
                          actions={actions.tableActions} />
                        <Pagination page={page} pageSize={PAGE_SIZE} total={directory.visible.length} noun="tasks" onPageChange={setPage} />
                      </> :

                      <div className="p-4">
                        <TaskBoard rows={directory.visible} actions={actions.tableActions} />
                      </div>
                  }
                </Card>
              </div>
            </div>
          </>
      }

      {actions.dialogs}
    </div>
  );
}
