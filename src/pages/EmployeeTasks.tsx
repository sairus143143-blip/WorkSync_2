import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, ClipboardListIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { useEmployees } from '../contexts/EmployeesContext';
import { useProjects } from '../contexts/ProjectsContext';
import { useTasks } from '../contexts/TasksContext';
import type { TaskStatus } from '../types/tasks';
import { formatTaskDate, taskStatusLabels } from '../utils/tasks';
import { fieldClass } from '../components/ui/Input';

const statuses: TaskStatus[] = ['todo', 'in_progress', 'in_review', 'blocked', 'completed'];

export function EmployeeTasks() {
  const { user } = useAuth();
  const { employees } = useEmployees();
  const { projects } = useProjects();
  const { tasks, updateAssignedTask } = useTasks();
  const employee = employees.find((item) => item.userId === user?.id);
  const assignedTasks = tasks.filter((task) => task.assignedEmployeeId === employee?.id);
  const [progressDrafts, setProgressDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  const saveProgress = (event: FormEvent<HTMLFormElement>, taskId: string, status: TaskStatus, currentProgress: number) => {
    event.preventDefault();
    const draft = progressDrafts[taskId] ?? String(currentProgress);
    const progress = Number(draft);
    if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
      setMessage('Progress must be between 0 and 100.');
      return;
    }
    if (!updateAssignedTask(taskId, status, progress)) {
      setMessage('This task could not be updated. Refresh and try again.');
      return;
    }
    setMessage('Task progress saved.');
    setProgressDrafts((current) => ({ ...current, [taskId]: String(progress) }));
  };

  return (
    <div className="space-y-6">
      <PageHeader title="My Tasks" description="Your assigned work, status, and deadlines." actions={
        <Link to="/my-reports" className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-medium text-ink hover:bg-bg">
          Weekly reports <ArrowRightIcon className="h-4 w-4" />
        </Link>
      } />
      {message && <p role="status" className="text-sm text-muted">{message}</p>}
      {assignedTasks.length === 0 ? (
        <Card><EmptyState icon={ClipboardListIcon} title="No tasks assigned" description="Tasks assigned to you will appear here." className="py-16" /></Card>
      ) : (
        <div className="space-y-3">
          {assignedTasks.map((task) => {
            const project = projects.find((item) => item.id === task.projectId);
            return (
              <Card key={task.id} className="p-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase text-muted">{task.taskCode}{project ? ` · ${project.name}` : ''}</p>
                    <h2 className="mt-1 text-base font-semibold text-ink">{task.title}</h2>
                    {task.description && <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">{task.description}</p>}
                    <p className="mt-3 text-xs text-muted">Due {formatTaskDate(task.dueDate)} · {task.priority} priority</p>
                    <Link to={`/my-reports?task=${encodeURIComponent(task.id)}`} className="mt-3 inline-flex text-sm font-medium text-primary hover:text-primary-hover">
                      View weekly reports
                    </Link>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:w-[360px]">
                    <label className="flex flex-col gap-1.5 text-[13px] font-medium text-ink">
                      Status
                      <select className={fieldClass} value={task.status} onChange={(event) => updateAssignedTask(task.id, event.target.value as TaskStatus, task.progress)}>
                        {statuses.map((status) => <option key={status} value={status}>{taskStatusLabels[status]}</option>)}
                      </select>
                    </label>
                    <form className="flex flex-col gap-1.5 text-[13px] font-medium text-ink" onSubmit={(event) => saveProgress(event, task.id, task.status, task.progress)}>
                      Progress
                      <div className="flex gap-2">
                        <input
                          aria-label={`Progress for ${task.title}`}
                          className={fieldClass}
                          type="number"
                          min="0"
                          max="100"
                          value={progressDrafts[task.id] ?? String(task.progress)}
                          onChange={(event) => setProgressDrafts((current) => ({ ...current, [task.id]: event.target.value }))} />
                        <Button type="submit" size="sm">Save</Button>
                      </div>
                    </form>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}