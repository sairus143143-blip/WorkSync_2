import React, { useMemo } from 'react';
import { GaugeIcon, ListChecksIcon, Clock3Icon, FolderKanbanIcon } from 'lucide-react';
import { useAttendance } from '../contexts/AttendanceContext';
import { useEmployees } from '../contexts/EmployeesContext';
import { useProjects } from '../contexts/ProjectsContext';
import { useTasks } from '../contexts/TasksContext';
import { workSchedule } from '../data/attendanceSchedule';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { calculateEmployeeProductivity } from '../utils/productivity';
import { employeeFullName } from '../utils/employees';

export function Productivity() {
  const { employees } = useEmployees();
  const { tasks } = useTasks();
  const { records } = useAttendance();
  const { projects, members } = useProjects();
  const rows = useMemo(() => calculateEmployeeProductivity(employees, tasks, records, projects, members, workSchedule.today, workSchedule), [employees, tasks, records, projects, members]);
  const totals = rows.reduce((sum, row) => ({ tasks: sum.tasks + row.totalTasks, completed: sum.completed + row.completedTasks, overdue: sum.overdue + row.overdueTasks, hours: sum.hours + row.workingHours, activeProjects: sum.activeProjects + row.activeProjects }), { tasks: 0, completed: 0, overdue: 0, hours: 0, activeProjects: 0 });
  const completionRate = totals.tasks ? Math.round(totals.completed / totals.tasks * 100) : 0;

  return <div className="space-y-6">
    <PageHeader title="Productivity" description="Measurable task, attendance, working-hours, and project activity from the current mock data." />
    <section aria-label="Productivity summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Tasks completed" value={`${totals.completed} / ${totals.tasks}`} icon={ListChecksIcon} tone="primary" hint={`${completionRate}% completion rate`} />
      <StatCard label="Overdue tasks" value={String(totals.overdue)} icon={GaugeIcon} tone="danger" hint="Open tasks past their due date" />
      <StatCard label="Recorded hours" value={`${totals.hours.toFixed(1)}h`} icon={Clock3Icon} tone="success" hint="From complete attendance records" />
      <StatCard label="Active project participation" value={String(totals.activeProjects)} icon={FolderKanbanIcon} tone="primary" hint="Employee memberships counted" />
    </section>
    <Card title="Employee activity" description="Rates are calculated from task and attendance records. Employees without activity display zero.">
      {rows.length === 0 ? <p className="text-sm text-muted">No employee records are available.</p> : <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead><tr className="border-b border-line text-xs uppercase tracking-wide text-muted"><th className="pb-3 pr-4 font-medium">Employee</th><th className="pb-3 px-3 font-medium">Tasks</th><th className="pb-3 px-3 font-medium">Completion</th><th className="pb-3 px-3 font-medium">Overdue</th><th className="pb-3 px-3 font-medium">Attendance days</th><th className="pb-3 px-3 font-medium">Hours</th><th className="pb-3 pl-3 font-medium">Projects</th></tr></thead>
          <tbody>{rows.map((row) => <tr key={row.employee.id} className="border-b border-line last:border-0">
            <th scope="row" className="py-3 pr-4 font-medium text-ink">{employeeFullName(row.employee)}<span className="mt-0.5 block text-xs font-normal text-muted">{row.employee.employeeNumber}</span></th>
            <td className="px-3 py-3 tabular-nums">{row.completedTasks} / {row.totalTasks}</td>
            <td className="px-3 py-3 tabular-nums">{row.completionRate}%</td>
            <td className="px-3 py-3 tabular-nums">{row.overdueTasks}</td>
            <td className="px-3 py-3 tabular-nums">{row.attendanceDays}</td>
            <td className="px-3 py-3 tabular-nums">{row.workingHours.toFixed(1)}h</td>
            <td className="pl-3 py-3 tabular-nums">{row.activeProjects} active · {row.completedProjects} completed</td>
          </tr>)}</tbody>
        </table>
      </div>}
    </Card>
  </div>;
}
