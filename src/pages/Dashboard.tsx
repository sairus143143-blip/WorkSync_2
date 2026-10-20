import React, { useState } from 'react';
import { format } from 'date-fns';
import { AttendanceOverview } from '../components/dashboard/AttendanceOverview';
import { ProjectOverview } from '../components/dashboard/ProjectOverview';
import { QuickActions } from '../components/dashboard/QuickActions';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { TaskOverview } from '../components/dashboard/TaskOverview';
import { UpcomingDeadlines } from '../components/dashboard/UpcomingDeadlines';
import { Alert } from '../components/ui/Alert';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { summaryStats } from '../data/dashboard';
import { firstName, greeting } from '../utils/format';
import { useEmployees } from '../contexts/EmployeesContext';
import { useAttendance } from '../contexts/AttendanceContext';
import { useProjects } from '../contexts/ProjectsContext';
import { useTasks } from '../contexts/TasksContext';
import { workSchedule } from '../data/attendanceSchedule';
import { calculateDashboardMetrics } from '../utils/dashboardMetrics';
import { useAuth } from '../contexts/AuthContext';
import { EmployeeDashboard } from './EmployeeDashboard';

export function Dashboard() {
  const [showNotice, setShowNotice] = useState(true);
  const { employees } = useEmployees();
  const { records } = useAttendance();
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const { user } = useAuth();
  const metrics = calculateDashboardMetrics(employees, records, projects, tasks, workSchedule.today);
  const liveStats = summaryStats.map((stat) => {
    const values: Record<string, string> = { total: String(metrics.totalEmployees), active: String(metrics.activeEmployees), present: String(metrics.present), late: String(metrics.late), absent: String(metrics.absent), projects: String(metrics.activeProjects), pending: String(metrics.pendingTasks), overdue: String(metrics.overdueTasks) };
    return { ...stat, value: values[stat.id] ?? '0', delta: undefined, trend: undefined, hint: stat.id === 'present' ? `${metrics.onLeave} on approved leave` : stat.hint };
  });

  if (user?.role === 'employee') return <EmployeeDashboard />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting()}, ${firstName(user?.name ?? 'there')}`}
        description={`${format(new Date(), 'EEEE, MMMM d')} · Here's how your workforce is doing today.`} />
      

      {showNotice &&
      <Alert tone="info" title="You're viewing sample data" onDismiss={() => setShowNotice(false)}>
          WorkSync – Employee Workforce &amp; Productivity Management Platform is a frontend prototype. All figures are mock values.
        </Alert>
      }

      <QuickActions />

      <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {liveStats.map((stat) =>
        <StatCard
          key={stat.id}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          tone={stat.tone}
          delta={stat.delta}
          trend={stat.trend}
          positive={stat.positive}
          hint={stat.hint}
          featured={stat.featured} />

        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <AttendanceOverview className="lg:col-span-2" />
        <TaskOverview />
        <ProjectOverview className="lg:col-span-2" />
        <RecentActivity />
      </div>

      <UpcomingDeadlines />
    </div>);

}
