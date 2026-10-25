import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ActivityIcon, CalendarDaysIcon, CheckCircle2Icon, Clock3Icon, DownloadIcon, FolderKanbanIcon, ListChecksIcon, UsersIcon } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { Select } from '../components/ui/Select';
import { StatCard } from '../components/ui/StatCard';
import { useAttendance } from '../contexts/AttendanceContext';
import { useEmployees } from '../contexts/EmployeesContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { useProjects } from '../contexts/ProjectsContext';
import { useTasks } from '../contexts/TasksContext';
import { ATTENDANCE_STATUS_LABELS, buildRangeRows, workedMinutes } from '../utils/attendance';
import { employeeFullName } from '../utils/employees';
import { chartColors } from '../utils/chartColors';
import { calculateEmployeeProductivity } from '../utils/productivity';
import { downloadCsv, isValidReportDate, reportDateRange, type ReportPeriod } from '../utils/reports';
import { isTaskOverdue, taskStatusLabels } from '../utils/tasks';

const periodOptions = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'year', label: 'This year' },
  { value: 'custom', label: 'Custom range' }
];

const projectStatusLabels: Record<string, string> = { planning: 'Planning', active: 'Active', on_hold: 'On hold', completed: 'Completed', cancelled: 'Cancelled' };
const projectStatusColors: Record<string, string> = { planning: chartColors.secondary, active: chartColors.primary, on_hold: chartColors.warning, completed: chartColors.success, cancelled: chartColors.neutral };
const taskStatusColors: Record<string, string> = { todo: chartColors.neutral, in_progress: chartColors.primary, in_review: chartColors.secondary, completed: chartColors.success, blocked: chartColors.warning };

function percent(value: number, total: number) {
  return total > 0 ? `${Math.round(value / total * 100)}%` : '0%';
}

function hours(minutes: number) {
  return `${(minutes / 60).toFixed(1)}h`;
}

export function Reports() {
  const { employees } = useEmployees();
  const { positions } = useOrganization();
  const { records, schedule } = useAttendance();
  const { projects, members } = useProjects();
  const { tasks, activities } = useTasks();
  const [period, setPeriod] = useState<ReportPeriod>('month');
  const [customFrom, setCustomFrom] = useState('2026-10-01');
  const [customTo, setCustomTo] = useState(schedule.today);

  const range = reportDateRange(period, schedule.today, customFrom, customTo);
  const validRange = isValidReportDate(range.from) && isValidReportDate(range.to) && range.from <= range.to;
  const reportEnd = validRange && range.to > schedule.today ? schedule.today : range.to;

  const report = useMemo(() => {
    if (!validRange || range.from > schedule.today) return null;
    const scopedEmployees = employees;
    const employeeIds = new Set(scopedEmployees.map((employee) => employee.id));
    const attendanceRows = buildRangeRows(range.from, reportEnd, { employees: scopedEmployees, records, positions, schedule });
    const periodTasks = tasks.filter((task) => employeeIds.has(task.assignedEmployeeId) && isValidReportDate(task.createdAt.slice(0, 10)) && task.createdAt.slice(0, 10) >= range.from && task.createdAt.slice(0, 10) <= reportEnd);
    const scopedProjects = projects.filter((project) => isValidReportDate(project.createdAt.slice(0, 10)) && project.createdAt.slice(0, 10) >= range.from && project.createdAt.slice(0, 10) <= reportEnd);
    const attendanceRecords = attendanceRows.filter((row) => row.record).map((row) => row.record!);
    const expectedAttendance = attendanceRows.filter((row) => row.status !== 'on_leave');
    const presentRows = expectedAttendance.filter((row) => row.status === 'present' || row.status === 'late' || row.status === 'half_day' || row.status === 'incomplete');
    const attendanceMinutes = attendanceRecords.reduce((sum, record) => sum + workedMinutes(record.checkIn, record.checkOut, schedule), 0);
    const completedTasks = periodTasks.filter((task) => task.status === 'completed');
    const overdueTasks = periodTasks.filter((task) => isTaskOverdue(task, schedule.today));
    const completionEvents = new Map<string, string>();
    for (const activity of activities) {
      if (activity.type !== 'status_changed' || !/completed/i.test(activity.description)) continue;
      const date = activity.createdAt.slice(0, 10);
      if (!isValidReportDate(date) || date < range.from || date > reportEnd) continue;
      const previous = completionEvents.get(activity.taskId);
      if (!previous || activity.createdAt > previous) completionEvents.set(activity.taskId, activity.createdAt);
    }
    const onTimeEligible = completedTasks.filter((task) => completionEvents.has(task.id) && isValidReportDate(task.dueDate));
    const onTimeTasks = onTimeEligible.filter((task) => completionEvents.get(task.id)!.slice(0, 10) <= task.dueDate);
    const statusCounts = ['present', 'late', 'absent', 'on_leave', 'half_day', 'incomplete'].map((status) => ({ name: ATTENDANCE_STATUS_LABELS[status as keyof typeof ATTENDANCE_STATUS_LABELS], count: attendanceRows.filter((row) => row.status === status).length, key: status }));
    const taskStatuses = ['todo', 'in_progress', 'in_review', 'completed', 'blocked'].map((status) => ({ name: taskStatusLabels[status as keyof typeof taskStatusLabels], count: periodTasks.filter((task) => task.status === status).length, key: status }));
    const projectStatuses = ['planning', 'active', 'on_hold', 'completed', 'cancelled'].map((status) => ({ name: projectStatusLabels[status], count: scopedProjects.filter((project) => project.status === status).length, key: status }));
    const productivityRows = calculateEmployeeProductivity(scopedEmployees, periodTasks, attendanceRecords, scopedProjects, members, schedule.today, schedule);
    const employeesReport = productivityRows.map((metric) => {
      const eligible = attendanceRows.filter((row) => row.employee.id === metric.employee.id && row.status !== 'on_leave');
      const present = eligible.filter((row) => row.status === 'present' || row.status === 'late' || row.status === 'half_day' || row.status === 'incomplete').length;
      const employeeEligibleCompletions = onTimeEligible.filter((task) => task.assignedEmployeeId === metric.employee.id);
      const employeeOnTimeCompletions = onTimeTasks.filter((task) => task.assignedEmployeeId === metric.employee.id);
      const employee = metric.employee;
      return { ...metric, onTimeRate: employeeEligibleCompletions.length ? Math.round(employeeOnTimeCompletions.length / employeeEligibleCompletions.length * 100) : 0, position: positions.find((position) => position.id === employee.positionId)?.name ?? '—', attendanceRate: percent(present, eligible.length), attendanceMinutes: attendanceRows.filter((row) => row.employee.id === employee.id && row.record).reduce((sum, row) => sum + workedMinutes(row.checkIn, row.checkOut, schedule), 0) };
    });
    const activeProjects = scopedProjects.filter((project) => project.status === 'active').length;
    const completedProjects = scopedProjects.filter((project) => project.status === 'completed').length;
    const totalMembers = scopedProjects.reduce((sum, project) => sum + new Set(members.filter((member) => member.projectId === project.id && member.status === 'active' && employeeIds.has(member.employeeId)).map((member) => member.employeeId)).size, 0);
    return {
      employees: scopedEmployees,
      attendanceRows,
      presentDays: presentRows.length,
      attendanceRate: percent(presentRows.length, expectedAttendance.length),
      attendanceMinutes,
      statusCounts,
      tasks: periodTasks,
      completedTasks,
      overdueTasks,
      taskCompletionRate: percent(completedTasks.length, periodTasks.length),
      onTimeRate: percent(onTimeTasks.length, onTimeEligible.length),
      onTimeDenominator: onTimeEligible.length,
      taskStatuses,
      projects: scopedProjects,
      activeProjects,
      completedProjects,
      totalMembers,
      projectStatuses,
      employeesReport
    };
  }, [validRange, range.from, reportEnd, schedule.today, schedule, employees, records, positions, tasks, projects, members, activities]);

  const exportRows = report?.employeesReport.map((row) => [
    employeeFullName(row.employee), row.position, row.totalTasks, row.completedTasks,
    row.completionRate, row.onTimeRate, row.attendanceRate, row.workingHours.toFixed(1), row.activeProjects
  ]) ?? [];

  const exportReport = () => downloadCsv('worksync-employee-activity-report.csv', [
    'Employee', 'Position', 'Total Tasks', 'Completed Tasks', 'Task Completion Rate (%)', 'On-Time Rate (%)', 'Attendance Rate', 'Working Hours', 'Active Projects'
  ], exportRows);

  const dateLabel = validRange ? `${format(parseISO(range.from), 'MMM d, yyyy')} – ${format(parseISO(reportEnd), 'MMM d, yyyy')}` : 'Choose a valid date range';

  return <div className="space-y-6">
    <PageHeader title="Reports & Analytics" description="Review workforce attendance, task delivery, project activity, and measurable productivity." actions={<Button variant="secondary" leftIcon={<DownloadIcon className="h-4 w-4" />} onClick={exportReport} disabled={!exportRows.length} aria-label="Export filtered employee activity report as CSV">Export CSV</Button>} />

    <Card className="border-primary/15" bodyClassName="p-4 sm:p-5">
      <div className="grid gap-4 md:grid-cols-[minmax(180px,1fr)_auto] md:items-end">
        <Select label="Reporting period" value={period} onChange={(event) => setPeriod(event.target.value as ReportPeriod)} options={periodOptions} />
        <p className="pb-2 text-sm text-muted"><CalendarDaysIcon className="mr-1.5 inline h-4 w-4 text-secondary" aria-hidden />{dateLabel}</p>
      </div>
      {period === 'custom' && <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-[13px] font-medium text-ink">Start date<input className="h-10 rounded-lg border border-line bg-surface px-3 text-sm font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" type="date" value={customFrom} max={schedule.today} onChange={(event) => setCustomFrom(event.target.value)} /></label>
        <label className="flex flex-col gap-1.5 text-[13px] font-medium text-ink">End date<input className="h-10 rounded-lg border border-line bg-surface px-3 text-sm font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" type="date" value={customTo} min={customFrom} max={schedule.today} onChange={(event) => setCustomTo(event.target.value)} /></label>
      </div>}
      {!validRange && <p role="alert" className="mt-3 text-sm text-danger">Choose valid dates and make sure the start date is not after the end date.</p>}
      {validRange && range.to > schedule.today && <p className="mt-3 text-xs text-muted">This report is limited to available mock data through {schedule.today}.</p>}
    </Card>

    {!report ? <Card><EmptyState icon={CalendarDaysIcon} title="No report for this date range" description="Choose a valid range that includes dates available in the mock data." /></Card> : <>
      <section aria-label="Report summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Employees" value={String(report.employees.length)} icon={UsersIcon} tone="primary" hint="Across the workforce" />
        <StatCard label="Present days" value={String(report.presentDays)} icon={CheckCircle2Icon} tone="success" hint={`${report.attendanceRate} attendance rate`} />
        <StatCard label="Tasks" value={String(report.tasks.length)} icon={ListChecksIcon} tone="neutral" hint={`${report.completedTasks.length} completed`} />
        <StatCard label="Task completion" value={report.taskCompletionRate} icon={ActivityIcon} tone="primary" hint={`${report.overdueTasks.length} overdue`} />
        <StatCard label="Active projects" value={String(report.activeProjects)} icon={FolderKanbanIcon} tone="primary" hint={`${report.completedProjects} completed in period`} />
        <StatCard label="Absent days" value={String(report.statusCounts.find((item) => item.key === 'absent')?.count ?? 0)} icon={CalendarDaysIcon} tone="danger" hint="Expected workdays without attendance" />
        <StatCard label="Late days" value={String(report.statusCounts.find((item) => item.key === 'late')?.count ?? 0)} icon={Clock3Icon} tone="warning" hint={`${hours(report.attendanceMinutes)} recorded hours`} />
        <StatCard label="On-time completion" value={report.onTimeDenominator ? report.onTimeRate : '—'} icon={CheckCircle2Icon} tone="success" hint={report.onTimeDenominator ? `${report.onTimeRate} of activity-recorded completions` : 'No completion activity in this period'} />
      </section>

      <section aria-label="Analytics charts" className="grid gap-6 xl:grid-cols-2">
        <Card title="Attendance status" description={`Daily records · ${dateLabel}`}>
          {report.attendanceRows.length === 0 ? <EmptyState icon={CalendarDaysIcon} title="No attendance data" description="No eligible employee workdays fall within this period." /> : <div className="h-[270px]" role="img" aria-label={report.statusCounts.map((item) => `${item.name}: ${item.count}`).join(', ')}><ResponsiveContainer width="100%" height="100%"><BarChart data={report.statusCounts} margin={{ top: 12, right: 8, bottom: 8, left: 0 }}><CartesianGrid stroke={chartColors.line} vertical={false} /><XAxis dataKey="name" tick={{ fill: chartColors.muted, fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={56} /><YAxis allowDecimals={false} tick={{ fill: chartColors.muted, fontSize: 11 }} /><Tooltip /><Bar dataKey="count" name="Days" radius={[5, 5, 0, 0]}>{report.statusCounts.map((item) => <Cell key={item.key} fill={item.key === 'late' ? chartColors.warning : item.key === 'absent' ? chartColors.danger : item.key === 'on_leave' ? chartColors.neutral : item.key === 'completed' ? chartColors.success : chartColors.primary} />)}</Bar></BarChart></ResponsiveContainer></div>}
        </Card>
        <Card title="Tasks by status" description={`${report.tasks.length} tasks created in the selected period`}>
          {report.tasks.length === 0 ? <EmptyState icon={ListChecksIcon} title="No tasks in this period" description="Tasks are grouped by their recorded creation date." /> : <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_150px] sm:items-center"><div className="h-[250px]" role="img" aria-label={report.taskStatuses.map((item) => `${item.name}: ${item.count}`).join(', ')}><ResponsiveContainer width="100%" height="100%"><BarChart data={report.taskStatuses} layout="vertical" margin={{ top: 8, right: 24, bottom: 8, left: 12 }}><CartesianGrid stroke={chartColors.line} horizontal={false} /><XAxis type="number" allowDecimals={false} tick={{ fill: chartColors.muted, fontSize: 11 }} /><YAxis type="category" dataKey="name" width={82} tick={{ fill: chartColors.muted, fontSize: 11 }} /><Tooltip /><Bar dataKey="count" name="Tasks" radius={[0, 5, 5, 0]}>{report.taskStatuses.map((item) => <Cell key={item.key} fill={taskStatusColors[item.key]} />)}</Bar></BarChart></ResponsiveContainer></div><dl className="space-y-3 text-sm">{report.taskStatuses.map((item) => <div key={item.key} className="flex items-center justify-between gap-3"><dt className="flex items-center gap-2 text-muted"><span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: taskStatusColors[item.key] }} />{item.name}</dt><dd className="font-semibold tabular-nums text-ink">{item.count}</dd></div>)}</dl></div>}
        </Card>
        <Card title="Projects by status" description={`${report.projects.length} projects created in the selected period`}>
          {report.projects.length === 0 ? <EmptyState icon={FolderKanbanIcon} title="No projects in this period" description="Project records are grouped by their creation date." /> : <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center"><div className="mx-auto h-[190px] w-[190px]" role="img" aria-label={report.projectStatuses.map((item) => `${item.name}: ${item.count}`).join(', ')}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={report.projectStatuses.filter((item) => item.count > 0)} dataKey="count" nameKey="name" innerRadius={52} outerRadius={80} paddingAngle={3}>{report.projectStatuses.filter((item) => item.count > 0).map((item) => <Cell key={item.key} fill={projectStatusColors[item.key]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div><dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">{report.projectStatuses.map((item) => <div key={item.key} className="flex items-center justify-between gap-2"><dt className="flex items-center gap-2 text-muted"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: projectStatusColors[item.key] }} />{item.name}</dt><dd className="font-semibold tabular-nums text-ink">{item.count}</dd></div>)}<div className="col-span-2 border-t border-line pt-3 text-muted">Member links in scope <span className="float-right font-semibold text-ink">{report.totalMembers}</span></div></dl></div>}
        </Card>
        <Card title="Project progress" description="Stored project progress for active projects in this period">
          {report.projects.filter((project) => project.status === 'active').length === 0 ? <EmptyState icon={FolderKanbanIcon} title="No active project progress" description="Active projects will appear here when present in the selected scope." /> : <div className="h-[270px]" role="img" aria-label="Active project progress percentages"><ResponsiveContainer width="100%" height="100%"><BarChart data={report.projects.filter((project) => project.status === 'active').slice(0, 8).map((project) => ({ name: project.code || project.name, progress: Number.isFinite(project.progress) ? Math.max(0, Math.min(100, project.progress)) : 0 }))} margin={{ top: 12, right: 12, bottom: 8, left: 0 }}><CartesianGrid stroke={chartColors.line} vertical={false} /><XAxis dataKey="name" tick={{ fill: chartColors.muted, fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={55} /><YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{ fill: chartColors.muted, fontSize: 11 }} /><Tooltip formatter={(value) => [`${value}%`, 'Progress']} /><Bar dataKey="progress" name="Progress" fill={chartColors.primary} radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div>}
        </Card>
      </section>

      <Card title="Employee activity report" description={`${report.employeesReport.length} employees · ${dateLabel}`} action={<Badge tone="primary">Full workforce</Badge>}>
        {report.employeesReport.length === 0 ? <EmptyState icon={UsersIcon} title="No employee activity" description="No employee records match this reporting period." /> : <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead><tr className="border-b border-line text-xs uppercase tracking-wide text-muted"><th scope="col" className="pb-3 pr-4 font-medium">Employee</th><th scope="col" className="px-3 pb-3 font-medium">Position</th><th scope="col" className="px-3 pb-3 font-medium">Tasks</th><th scope="col" className="px-3 pb-3 font-medium">Completion</th><th scope="col" className="px-3 pb-3 font-medium">Attendance</th><th scope="col" className="px-3 pb-3 font-medium">Hours</th><th scope="col" className="pb-3 pl-3 font-medium">Active projects</th></tr></thead><tbody>{report.employeesReport.map((row) => <tr key={row.employee.id} className="border-b border-line last:border-0"><th scope="row" className="py-3 pr-4 font-medium text-ink">{employeeFullName(row.employee)}<span className="mt-0.5 block text-xs font-normal text-muted">{row.employee.employeeNumber || '—'}</span></th><td className="px-3 py-3 text-muted">{row.position}</td><td className="px-3 py-3 tabular-nums">{row.completedTasks} / {row.totalTasks}</td><td className="px-3 py-3 tabular-nums">{row.completionRate}%</td><td className="px-3 py-3 tabular-nums">{row.attendanceRate}</td><td className="px-3 py-3 tabular-nums">{row.workingHours.toFixed(1)}h</td><td className="pl-3 py-3 tabular-nums">{row.activeProjects}</td></tr>)}</tbody></table></div>}
      </Card>
    </>}
  </div>;
}
