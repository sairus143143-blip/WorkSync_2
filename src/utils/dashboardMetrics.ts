import type { AttendanceRecord } from '../types/attendance';
import type { Employee } from '../types/employees';
import type { Project } from '../types/projects';
import type { Task } from '../types/tasks';
import { isTaskOverdue } from './tasks';

export function calculateDashboardMetrics(employees: Employee[], attendance: AttendanceRecord[], projects: Project[], tasks: Task[], today: string) {
  const expected = employees.filter((employee) => employee.employmentStatus !== 'inactive' && employee.dateHired <= today);
  const records = attendance.filter((record) => record.date === today);
  const statusOf = (employee: Employee) => records.find((record) => record.employeeId === employee.id)?.status ?? (employee.employmentStatus === 'on_leave' ? 'on_leave' : 'absent');
  const statuses = expected.map(statusOf);
  const overdue = tasks.filter((task) => isTaskOverdue(task, today)).length;
  return {
    totalEmployees: employees.length,
    activeEmployees: employees.filter((employee) => employee.employmentStatus === 'active').length,
    present: statuses.filter((status) => status === 'present' || status === 'late' || status === 'half_day' || status === 'incomplete').length,
    late: statuses.filter((status) => status === 'late').length,
    absent: statuses.filter((status) => status === 'absent').length,
    onLeave: statuses.filter((status) => status === 'on_leave').length,
    activeProjects: projects.filter((project) => project.status === 'active').length,
    pendingTasks: tasks.filter((task) => task.status !== 'completed').length,
    overdueTasks: overdue
  };
}
