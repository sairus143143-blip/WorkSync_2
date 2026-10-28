import { format, parseISO } from 'date-fns';
import { ArrowRightIcon, CheckCircle2Icon, ClipboardCheckIcon, Clock3Icon, ListChecksIcon, TriangleAlertIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { useAuth } from '../contexts/AuthContext';
import { useEmployees } from '../contexts/EmployeesContext';
import { useProgressReports } from '../contexts/ProgressReportsContext';
import { useTasks } from '../contexts/TasksContext';
import { currentDateOnly, getTaskReportPeriods, isPeriodElapsed } from '../utils/progressReports';
import { isTaskOverdue } from '../utils/tasks';

export function EmployeeDashboard() {
  const { user } = useAuth();
  const { employees } = useEmployees();
  const { tasks, activities } = useTasks();
  const { reports } = useProgressReports();
  const employee = employees.find((item) => item.userId === user?.id);
  const mine = tasks.filter((task) => task.assignedEmployeeId === employee?.id);
  const active = mine.filter((task) => task.status !== 'completed');
  const inProgress = mine.filter((task) => task.status === 'in_progress');
  const completed = mine.filter((task) => task.status === 'completed');
  const today = currentDateOnly();
  const overdue = active.filter((task) => isTaskOverdue(task, today))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const dueSoon = active.filter((task) => task.dueDate >= today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 5);
  const dueReports = mine.flatMap((task) => getTaskReportPeriods(task)
    .filter((period) => isPeriodElapsed(period))
    .filter((period) => !reports.some((report) => report.taskId === task.id && report.employeeId === employee?.id && report.periodStart === period.startDate && report.status !== 'needs_revision'))).length;
  const taskIds = new Set(mine.map((task) => task.id));
  const recentActivity = activities.filter((activity) => taskIds.has(activity.taskId)).slice(-5).reverse();
  const awaitingReview = reports.filter((report) => report.employeeId === employee?.id && report.status === 'submitted').length;

  return (
    <div className="space-y-6">
      <PageHeader title={`Welcome, ${user?.name.split(' ')[0] ?? 'there'}`} description="Your assigned work, upcoming deadlines, and weekly reporting." />
      <section aria-label="My work summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Assigned tasks" value={String(mine.length)} icon={ListChecksIcon} tone="primary" />
        <StatCard label="In progress" value={String(inProgress.length)} icon={Clock3Icon} tone="warning" />
        <StatCard label="Completed" value={String(completed.length)} icon={CheckCircle2Icon} tone="success" />
        <StatCard label="Overdue" value={String(overdue.length)} icon={TriangleAlertIcon} tone="danger" />
        <StatCard label="Reports due" value={String(dueReports)} icon={ClipboardCheckIcon} tone="primary" />
        <StatCard label="Reports awaiting review" value={String(awaitingReview)} icon={ClipboardCheckIcon} tone="neutral" />
      </section>
      {overdue.length > 0 && (
        <section aria-labelledby="overdue-tasks-heading" className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 id="overdue-tasks-heading" className="text-base font-semibold text-ink">Overdue tasks</h2>
            <Link to="/my-tasks" className="text-sm font-medium text-primary">Review tasks</Link>
          </div>
          <Card className="divide-y divide-line">
            {overdue.slice(0, 5).map((task) => (
              <Link key={task.id} to="/my-tasks" className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">{task.title}</span>
                  <span className="text-xs text-muted">{task.taskCode} · {task.progress}% complete</span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-sm tabular-nums text-danger">{format(parseISO(task.dueDate), 'MMM d')}</span>
                  <span className="text-xs font-medium text-danger">Overdue</span>
                </span>
              </Link>
            ))}
          </Card>
        </section>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="employee-deadlines-heading" className="space-y-3">
          <div className="flex items-center justify-between"><h2 id="employee-deadlines-heading" className="text-base font-semibold text-ink">Upcoming deadlines</h2><Link to="/my-tasks" className="text-sm font-medium text-primary">All tasks</Link></div>
          <Card className="divide-y divide-line">
            {dueSoon.length === 0 ? <p className="py-8 text-center text-sm text-muted">No active task deadlines.</p> : dueSoon.map((task) => (
              <Link key={task.id} to="/my-tasks" className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <span className="min-w-0"><span className="block truncate text-sm font-medium text-ink">{task.title}</span><span className="text-xs text-muted">{task.taskCode} · {task.progress}% complete</span></span>
                <span className="shrink-0 text-right">
                  <span className="block text-sm tabular-nums text-muted">{format(parseISO(task.dueDate), 'MMM d')}</span>
                </span>
              </Link>
            ))}
          </Card>
        </section>
        <section aria-labelledby="employee-reports-heading" className="space-y-3">
          <div className="flex items-center justify-between"><h2 id="employee-reports-heading" className="text-base font-semibold text-ink">Weekly reports</h2><Link to="/my-reports" className="inline-flex items-center gap-1 text-sm font-medium text-primary">Open reports <ArrowRightIcon className="h-3.5 w-3.5" /></Link></div>
          <Card className="p-5">
            <p className="text-sm text-muted">{dueReports === 0 ? 'You have no elapsed reporting periods waiting for a submission.' : `${dueReports} elapsed reporting period${dueReports === 1 ? '' : 's'} need a report or revision.`}</p>
            <Link to="/my-reports" className="mt-4 inline-flex text-sm font-semibold text-primary">Review my reports</Link>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-ink">Recent task activity</h3>
            {recentActivity.length === 0 ? <p className="mt-3 text-sm text-muted">Updates on your assigned work will appear here.</p> : <ul className="mt-3 space-y-3">{recentActivity.map((activity) => <li key={activity.id} className="text-sm"><p className="text-ink">{activity.description}</p><p className="mt-0.5 text-xs text-muted">{format(parseISO(activity.createdAt), 'MMM d, h:mm a')}</p></li>)}</ul>}
          </Card>
        </section>
      </div>
    </div>
  );
}