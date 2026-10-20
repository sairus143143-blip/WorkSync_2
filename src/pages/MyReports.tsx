import { useMemo, useState } from 'react';
import { ClipboardCheckIcon, FileTextIcon } from 'lucide-react';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { useEmployees } from '../contexts/EmployeesContext';
import { useProgressReports } from '../contexts/ProgressReportsContext';
import { useTasks } from '../contexts/TasksContext';
import { getTaskReportPeriods, isPeriodElapsed, reportPeriodLabel } from '../utils/progressReports';

export function MyReports() {
  const { user } = useAuth();
  const { employees } = useEmployees();
  const { tasks } = useTasks();
  const { reports, submitReport } = useProgressReports();
  const employee = employees.find((item) => item.userId === user?.id);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  const obligations = useMemo(() => {
    if (!employee) return [];
    return tasks
      .filter((task) => task.assignedEmployeeId === employee.id)
      .flatMap((task) => getTaskReportPeriods(task)
        .filter((period) => isPeriodElapsed(period))
        .map((period) => ({ task, period })));
  }, [employee, tasks]);
  const myReports = reports.filter((report) => report.employeeId === employee?.id)
    .sort((a, b) => b.periodStart.localeCompare(a.periodStart));

  const submit = (taskId: string, periodStart: string, key: string) => {
    const result = submitReport(taskId, periodStart, drafts[key] ?? '');
    if (!result) {
      setFeedback('Reports require at least 10 characters and can only be submitted for an elapsed period on your assigned task.');
      return;
    }
    setFeedback('Weekly report submitted.');
    setDrafts((current) => ({ ...current, [key]: '' }));
  };

  return (
    <div className="space-y-6">
      <PageHeader title="My Weekly Reports" description="Submit progress for completed reporting periods and review feedback." />
      {feedback && <Alert tone={feedback.startsWith('Weekly') ? 'success' : 'info'} title={feedback} />}
      <section className="space-y-3" aria-labelledby="reports-due-heading">
        <div className="flex items-center justify-between gap-3">
          <h2 id="reports-due-heading" className="text-base font-semibold text-ink">Periods ready to report</h2>
          <span className="text-sm text-muted">{obligations.filter(({ task, period }) => !reports.some((report) => report.taskId === task.id && report.employeeId === employee?.id && report.periodStart === period.startDate && report.status !== 'needs_revision')).length} outstanding</span>
        </div>
        {obligations.length === 0 ? (
          <Card><EmptyState icon={ClipboardCheckIcon} title="No reporting periods due" description="Weekly reporting periods will appear here when they have elapsed." className="py-12" /></Card>
        ) : obligations.map(({ task, period }) => {
          const report = reports.find((item) => item.taskId === task.id && item.employeeId === employee?.id && item.periodStart === period.startDate);
          const key = `${task.id}:${period.startDate}`;
          const latest = report?.versions[report.versions.length - 1];
          const reviewEvents = report?.reviewEvents.filter((event) => event.versionId === latest?.id) ?? [];
          const latestFeedback = reviewEvents[reviewEvents.length - 1];
          const canSubmit = !report || report.status === 'needs_revision';
          return (
            <Card key={key} className="p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase text-muted">{task.taskCode} · Due {period.dueDate}</p>
                  <h3 className="mt-1 font-semibold text-ink">{task.title}</h3>
                  <p className="mt-1 text-sm text-muted">Period {reportPeriodLabel(period)}</p>
                  {latest && <p className="mt-2 text-sm text-muted">Latest snapshot: {latest.progress}% · {latest.taskStatus.replace('_', ' ')}</p>}
                  {latestFeedback?.feedback && <p className="mt-3 border-l-2 border-warning pl-3 text-sm text-ink">Admin feedback: {latestFeedback.feedback}</p>}
                </div>
                <div className="w-full md:max-w-lg">
                  {canSubmit ? (
                    <div className="space-y-2">
                      <label className="sr-only" htmlFor={`report-${key}`}>Weekly progress summary for {task.title}</label>
                      <textarea
                        id={`report-${key}`}
                        className="min-h-24 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Summarize completed work, blockers, and next steps (at least 10 characters)."
                        value={drafts[key] ?? ''}
                        onChange={(event) => setDrafts((current) => ({ ...current, [key]: event.target.value }))} />
                      <Button onClick={() => submit(task.id, period.startDate, key)}>
                        {report ? 'Submit revision' : 'Submit report'}
                      </Button>
                    </div>
                  ) : (
                    <span className="inline-flex rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">
                      {report?.status === 'reviewed' ? 'Reviewed' : 'Submitted'}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </section>

      <section className="space-y-3" aria-labelledby="report-history-heading">
        <h2 id="report-history-heading" className="text-base font-semibold text-ink">Submission history</h2>
        {myReports.length === 0 ? (
          <Card><EmptyState icon={FileTextIcon} title="No reports submitted" description="Your submitted reports and review decisions will be kept here." className="py-12" /></Card>
        ) : myReports.map((report) => (
          <Card key={report.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-muted">{report.taskCode} · {reportPeriodLabel({ startDate: report.periodStart, endDate: report.periodEnd })}</p>
                <h3 className="mt-1 font-semibold text-ink">{report.taskTitle}</h3>
                <p className="mt-2 text-sm text-muted">{report.versions.length} submission version{report.versions.length === 1 ? '' : 's'} · Latest snapshot {report.versions[report.versions.length - 1]?.progress}%</p>
              </div>
              <span className="rounded-full bg-bg px-2.5 py-1 text-xs font-semibold capitalize text-muted">{report.status.replace('_', ' ')}</span>
            </div>
            <ol className="mt-4 space-y-3 border-l border-line pl-4">
              {report.versions.map((version, index) => <li key={version.id} className="text-sm">
                <p className="font-medium text-ink">Version {index + 1} · {version.progress}% · {version.taskStatus.replace('_', ' ')}</p>
                <p className="mt-0.5 text-xs text-muted">Submitted {new Date(version.submittedAt).toLocaleString()}</p>
                <p className="mt-1 whitespace-pre-wrap leading-relaxed text-muted">{version.summary}</p>
              </li>)}
            </ol>
            {report.reviewEvents.map((event) => (
              <p key={event.id} className="mt-3 border-l-2 border-line pl-3 text-sm text-muted">
                {event.action === 'reviewed' ? 'Reviewed' : 'Revision requested'} by {event.reviewerName}: {event.feedback || 'No additional feedback.'}
              </p>
            ))}
          </Card>
        ))}
      </section>
    </div>
  );
}