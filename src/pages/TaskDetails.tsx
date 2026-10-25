import React, { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, CloudOffIcon, PencilIcon, SearchXIcon } from 'lucide-react';
import { TaskActivityList } from '../components/tasks/TaskActivityList';
import { TaskDeadlineIndicators, TaskPriorityBadge, TaskStatusBadge } from '../components/tasks/TaskBadges';
import { TaskDetailsLoading } from '../components/tasks/TasksLoading';
import { useTaskActions } from '../components/tasks/useTaskActions';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useEmployees } from '../contexts/EmployeesContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { useProjects } from '../contexts/ProjectsContext';
import { useTasks } from '../contexts/TasksContext';
import { useUsers } from '../contexts/UsersContext';
import { useSimulatedLoad } from '../hooks/useSimulatedLoad';
import { formatActivityTime } from '../utils/projects';
import { buildTaskRow, employeeTaskCounts, formatTaskDate } from '../utils/tasks';

interface TaskDetailsProps {
  simulateLoadError?: boolean;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink">{children}</dd>
    </div>
  );
}

export function TaskDetails({ simulateLoadError = false }: TaskDetailsProps) {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { tasks, activities } = useTasks();
  const { projects } = useProjects();
  const { employees } = useEmployees();
  const { positions } = useOrganization();
  const { users } = useUsers();
  const { state: loadState, retry } = useSimulatedLoad(simulateLoadError);
  const actions = useTaskActions();

  const task = tasks.find((t) => t.id === taskId);
  const row = useMemo(() => {
    if (!task) return null;
    return buildTaskRow(task, projects, employees, positions);
  }, [task, projects, employees, positions]);

  const taskActivities = useMemo(
    () => activities.filter((a) => a.taskId === taskId),
    [activities, taskId]
  );

  const back =
    <Link
      to="/tasks"
      className="inline-flex items-center gap-1.5 rounded text-[13px] font-medium text-muted transition-colors duration-150 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
      
      <ArrowLeftIcon className="h-4 w-4" aria-hidden />
      All tasks
    </Link>;

  if (loadState === 'loading') return <TaskDetailsLoading />;
  if (loadState === 'error') {
    return (
      <div className="space-y-4">
        {back}
        <Card>
          <EmptyState
            icon={CloudOffIcon}
            title="Unable to load task data."
            action={<Button onClick={retry}>Try Again</Button>}
            className="py-16" />
        </Card>
      </div>
    );
  }
  if (!task || !row) {
    return (
      <div className="space-y-4">
        {back}
        <Card>
          <EmptyState
            icon={SearchXIcon}
            title="Task not found"
            description="This task doesn’t exist or the link is incorrect."
            action={<Button onClick={() => navigate('/tasks')}>Back to tasks</Button>}
            className="py-16" />
        </Card>
      </div>
    );
  }

  const creator = users.find((u) => u.id === task.createdByUserId);
  const counts = employeeTaskCounts(tasks, task.assignedEmployeeId);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {back}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">{task.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px]">
              <span className="tabular-nums text-muted">{task.taskCode}</span>
              <TaskStatusBadge status={task.status} />
              <TaskPriorityBadge priority={task.priority} />
              <TaskDeadlineIndicators overdue={row.overdue} dueToday={row.dueToday} dueSoon={row.dueSoon} />
            </div>
          </div>
          <Button leftIcon={<PencilIcon className="h-4 w-4" />} onClick={() => actions.openEdit(row)}>
            Edit Task
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Task information">
            <p className="text-sm leading-relaxed text-ink">{task.description || <span className="text-muted">No description provided.</span>}</p>
            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
              <Field label="Start date">{formatTaskDate(task.startDate)}</Field>
              <Field label="Due date">{formatTaskDate(task.dueDate)}</Field>
              <Field label="Created">{formatActivityTime(task.createdAt)}</Field>
              <Field label="Created by">{creator ? `${creator.firstName} ${creator.lastName}` : 'System Administrator'}</Field>
            </dl>
          </Card>

          <Card title="Project">
            <p className="font-medium text-ink">{row.project.name}</p>
            <p className="text-[13px] tabular-nums text-muted">{row.project.code}</p>
            <Button variant="ghost" size="sm" className="mt-3" onClick={() => navigate(`/projects/${row.project.id}`)}>
              View project
            </Button>
          </Card>

          <Card title="Progress">
            <div className="rounded-lg bg-bg px-4 py-3">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-[13px] text-muted">Task Progress</span>
                <span className="text-xl font-semibold tabular-nums text-ink">{task.progress}%</span>
              </div>
              <ProgressBar value={task.progress} size="md" label="Task progress" />
            </div>
          </Card>

          <Card title="Activity">
            <TaskActivityList activities={taskActivities} />
          </Card>
        </div>

        <Card title="Assigned Employee" className="self-start">
          <div className="flex items-center gap-3">
            <Avatar name={row.employeeName} src={row.employee.avatar ?? undefined} size="md" />
            <div>
              <p className="font-medium text-ink">{row.employeeName}</p>
              <p className="text-[13px] tabular-nums text-muted">{row.employee.employeeNumber}</p>
            </div>
          </div>
          <dl className="mt-4 space-y-3">
            <Field label="Position">{row.position?.name ?? '—'}</Field>
            <Field label="Active Tasks">{counts.active}</Field>
            <Field label="Completed Tasks">{counts.completed}</Field>
            <Field label="Overdue Tasks">{counts.overdue}</Field>
          </dl>
        </Card>
      </div>

      {actions.dialogs}
    </div>
  );
}
