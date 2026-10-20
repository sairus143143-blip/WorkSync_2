import type { AttendanceRecord } from '../types/attendance';
import type { Employee } from '../types/employees';
import type { Project, ProjectMember } from '../types/projects';
import type { Task } from '../types/tasks';
import { workedMinutes } from './attendance';
import { isTaskOverdue } from './tasks';

export function calculateEmployeeProductivity(employees: Employee[], tasks: Task[], attendance: AttendanceRecord[], projects: Project[], members: ProjectMember[], today: string, schedule: Parameters<typeof workedMinutes>[2]) {
  return employees.map((employee) => {
    const assigned = tasks.filter((task) => task.assignedEmployeeId === employee.id);
    const completed = assigned.filter((task) => task.status === 'completed');
    const eligibleCompleted = completed.filter((task) => task.dueDate && task.dueDate <= today);
    const employeeAttendance = attendance.filter((record) => record.employeeId === employee.id && record.date <= today);
    const workingMinutes = employeeAttendance.reduce((sum, record) => sum + workedMinutes(record.checkIn, record.checkOut, schedule), 0);
    const projectIds = new Set(members.filter((member) => member.employeeId === employee.id && member.status === 'active').map((member) => member.projectId));
    const participated = projects.filter((project) => projectIds.has(project.id));
    return {
      employee,
      totalTasks: assigned.length,
      completedTasks: completed.length,
      inProgressTasks: assigned.filter((task) => task.status === 'in_progress' || task.status === 'in_review').length,
      overdueTasks: assigned.filter((task) => isTaskOverdue(task, today)).length,
      completionRate: assigned.length ? Math.round(completed.length / assigned.length * 100) : 0,
      onTimeRate: eligibleCompleted.length ? Math.round(eligibleCompleted.filter((task) => task.dueDate >= today).length / eligibleCompleted.length * 100) : 0,
      attendanceDays: employeeAttendance.filter((record) => record.status === 'present' || record.status === 'late' || record.status === 'half_day').length,
      workingHours: Math.round(workingMinutes / 60 * 10) / 10,
      activeProjects: participated.filter((project) => project.status === 'active' || project.status === 'on_hold').length,
      completedProjects: participated.filter((project) => project.status === 'completed').length
    };
  });
}
