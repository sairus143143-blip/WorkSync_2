import { useMemo, useState } from 'react';
import { ClipboardListIcon, SearchIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { fieldClass } from '../components/ui/Input';
import { useEmployees } from '../contexts/EmployeesContext';
import { useProgressReports } from '../contexts/ProgressReportsContext';
import { useTasks } from '../contexts/TasksContext';
import type { ProgressReportStatus } from '../types/progressReports';
import { getTaskReportPeriods, isPeriodElapsed, reportPeriodLabel } from '../utils/progressReports';

const statuses: Array<'all' | ProgressReportStatus> = ['all', 'submitted', 'needs_revision', 'reviewed'];

export function WeeklyReports() {
  const { reports, reviewReport } = useProgressReports();
  const { tasks } = useTasks();
  const { employees } = useEmployees();
  const [status, setStatus] = useState<'all' | ProgressReportStatus>('all');
  const [query, setQuery] = useState('');
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  const missingPeriods = useMemo(() => tasks.flatMap((task) => {
    const employee = employees.find((item) => item.id === task.assignedEmployeeId);
    if (!employee || employee.employmentStatus === 'inactive') return [];
    return getTaskReportPeriods(task).filter((period) => isPeriodElapsed(period)).filter((period) =>
      !reports.some((report) => report.taskId === task.id && report.employeeId === employee.id && report.periodStart === period.startDate)
    ).map((period) => ({ task, employee, period }));
  }), [employees, reports, tasks]);

  const visibleReports = reports.filter((report) => {
    const matchesStatus = status === 'all' || report.status === status;
    const text = `${report.employeeName} ${report.taskTitle} ${report.taskCode}`.toLowerCase();
    return matchesStatus && text.includes(query.trim().toLowerCase());
  }).sort((a, b) => b.periodStart.localeCompare(a.periodStart));

  const decide = (reportId: string, action: 'reviewed' | 'revision_requested') => {
    const ok = reviewReport(reportId, action, feedbackDrafts[reportId] ?? '');
    setMessage(ok ? (action === 'reviewed' ? 'Report marked as reviewed.' : 'Revision requested.') : 'A feedback note is required when requesting a revision.');
    if (ok) setFeedbackDrafts((current) => ({ ...current, [reportId]: '' }));
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Weekly Report Review" description="Review employee progress snapshots and follow up on missing periods." />
      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <div><p className="text-sm text-muted">Submitted reports</p><p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{reports.length}</p></div>
          <div><p className="text-sm text-muted">Awaiting review</p><p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{reports.filter((report) => report.status === 'submitted').length}</p></div>
          <div><p className="text-sm text-muted">Missing periods</p><p className="mt-1 text-2xl font-semibold tabular-nums text-danger">{missingPeriods.length}</p></div>
        </div>
      </Card>
      {message && <p role="status" className="text-sm text-muted">{message}</p>}

      <section className="space-y-3" aria-labelledby="missing-periods-heading">
        <h2 id="missing-periods-heading" className="text-base font-semibold text-ink">Missing or overdue periods</h2>
        {missingPeriods.length === 0 ? (
          <p className="border-y border-line py-4 text-sm text-muted">All elapsed reporting periods have a submission.</p>
        ) : (
          <div className="overflow-x-auto border-y border-line">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-line text-xs uppercase text-muted"><tr><th className="py-3 pr-4 font-semibold">Employee</th><th className="py-3 pr-4 font-semibold">Task</th><th className="py-3 pr-4 font-semibold">Period</th><th className="py-3 font-semibold">Due</th></tr></thead>
              <tbody>{missingPeriods.map(({ task, employee, period }) => <tr key={`${task.id}:${period.startDate}`} className="border-b border-line last:border-0">
                <td className="py-3 pr-4 font-medium text-ink">{employee.firstName} {employee.lastName}</td>
                <td className="py-3 pr-4 text-ink">{task.taskCode} · {task.title}</td>
                <td className="py-3 pr-4 text-muted">{reportPeriodLabel(period)}</td>
                <td className="py-3 text-danger">{period.dueDate}</td>
              </tr>)}</tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-4" aria-labelledby="submitted-reports-heading">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="submitted-reports-heading" className="text-base font-semibold text-ink">Submitted reports</h2>
          <div className="flex gap-2">
            <label className="relative flex-1 sm:w-64">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden />
              <input className={`${fieldClass} pl-9`} aria-label="Search reports" placeholder="Employee or task" value={query} onChange={(event) => setQuery(event.target.value)} />
            </label>
            <select className={fieldClass} aria-label="Filter report status" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
              {statuses.map((item) => <option key={item} value={item}>{item === 'all' ? 'All statuses' : item.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>
        {visibleReports.length === 0 ? (
          <Card><EmptyState icon={ClipboardListIcon} title="No reports found" description="Submitted weekly reports matching these filters will appear here." className="py-12" /></Card>
        ) : visibleReports.map((report) => {
          const latest = report.versions[report.versions.length - 1];
          return (
            <Card key={report.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted">{report.employeeName} · {report.taskCode} · {reportPeriodLabel({ startDate: report.periodStart, endDate: report.periodEnd })}</p>
                  <h3 className="mt-1 font-semibold text-ink">{report.taskTitle}</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink">{latest?.summary}</p>
                  <p className="mt-2 text-xs text-muted">Snapshot: {latest?.progress}% · {latest?.taskStatus.replace('_', ' ')} · {report.versions.length} version{report.versions.length === 1 ? '' : 's'}</p>
                </div>
                <span className="rounded-full bg-bg px-2.5 py-1 text-xs font-semibold capitalize text-muted">{report.status.replace('_', ' ')}</span>
              </div>
              {report.versions.length > 1 && <ol className="mt-4 space-y-3 border-l border-line pl-4">
                {report.versions.map((version, index) => <li key={version.id} className="text-sm">
                  <p className="font-medium text-ink">Version {index + 1} · {version.progress}% · {version.taskStatus.replace('_', ' ')}</p>
                  <p className="mt-0.5 text-xs text-muted">Submitted {new Date(version.submittedAt).toLocaleString()}</p>
                  <p className="mt-1 whitespace-pre-wrap leading-relaxed text-muted">{version.summary}</p>
                </li>)}
              </ol>}
              {report.reviewEvents.map((event) => <p key={event.id} className="mt-3 border-l-2 border-line pl-3 text-sm text-muted">{event.reviewerName} · {event.action === 'reviewed' ? 'Reviewed' : 'Revision requested'} · {event.feedback || 'No additional feedback.'}</p>)}
              {report.status !== 'reviewed' && <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
                <label className="flex-1 text-[13px] font-medium text-ink">
                  Feedback
                  <textarea className="mt-1.5 min-h-20 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm font-normal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" value={feedbackDrafts[report.id] ?? ''} onChange={(event) => setFeedbackDrafts((current) => ({ ...current, [report.id]: event.target.value }))} placeholder="Add feedback or explain requested changes." />
                </label>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => decide(report.id, 'revision_requested')}>Request revision</Button>
                  <Button onClick={() => decide(report.id, 'reviewed')}>Mark reviewed</Button>
                </div>
              </div>}
            </Card>
          );
        })}
      </section>
    </div>
  );
}