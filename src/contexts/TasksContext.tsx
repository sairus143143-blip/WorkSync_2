import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { currentUser } from '../data/currentUser';
import { taskActivities as seedActivities } from '../data/taskActivity';
import { tasks as seedTasks } from '../data/tasks';
import type { ProjectMember } from '../types/projects';
import type { Task, TaskActivity, TaskActivityType, TaskFormValues, TaskPriority, TaskStatus } from '../types/tasks';
import { employeeFullName } from '../utils/employees';
import { normalizeTaskProgress, nextTaskId, taskNowIso, taskPriorityLabels, taskStatusLabels } from '../utils/tasks';
import { useEmployees } from './EmployeesContext';
import { useProjects } from './ProjectsContext';
import { useActivity } from './ActivityContext';
import { useNotifications } from './NotificationContext';
import { useAuth } from './AuthContext';

interface TasksContextValue {
  tasks: Task[];
  activities: TaskActivity[];
  createTask: (values: TaskFormValues) => Task;
  updateTask: (id: string, values: TaskFormValues) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  setTaskProgress: (id: string, progress: number) => void;
  updateAssignedTask: (id: string, status: TaskStatus, progress: number) => boolean;
  reassignTask: (id: string, employeeId: string) => void;
}

const TasksContext = createContext<TasksContextValue | null>(null);
const TASKS_STORAGE_KEY = 'worksync.tasks.v1';
const ACTIVITIES_STORAGE_KEY = 'worksync.taskActivities.v1';

function readStored<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return fallback;
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed as T : fallback;
  } catch {
    return fallback;
  }
}

function toFields(values: TaskFormValues) {
  const normalized = normalizeTaskProgress(values.status as TaskStatus, Number(values.progress) || 0);
  return {
    taskCode: values.taskCode.trim().toUpperCase(),
    projectId: values.projectId,
    title: values.title.trim(),
    description: values.description.trim(),
    assignedEmployeeId: values.assignedEmployeeId,
    priority: values.priority as TaskPriority,
    status: normalized.status,
    startDate: values.startDate,
    dueDate: values.dueDate,
    progress: normalized.progress
  };
}

/** Mock task store — replace with API later. */
export function TasksProvider({ children }: { children: React.ReactNode }) {
  const { employees } = useEmployees();
  const { record } = useActivity();
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(() => readStored(TASKS_STORAGE_KEY, seedTasks));
  const [activities, setActivities] = useState<TaskActivity[]>(() => readStored(ACTIVITIES_STORAGE_KEY, seedActivities));
  const counter = useRef({ activity: seedActivities.length + 1 });

  useEffect(() => {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
      localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities));
    } catch {
      // Storage may be unavailable in a sandboxed preview.
    }
  }, [tasks, activities]);

  const nameOf = useCallback(
    (employeeId: string) => {
      const e = employees.find((x) => x.id === employeeId);
      return e ? employeeFullName(e) : 'an employee';
    },
    [employees]
  );

  const log = useCallback((taskId: string, type: TaskActivityType, description: string) => {
    const record: TaskActivity = {
      id: `TA-${String(counter.current.activity++).padStart(3, '0')}`,
      taskId,
      type,
      description,
      createdByUserId: currentUser.id,
      createdAt: taskNowIso()
    };
    setActivities((current) => [...current, record]);
  }, []);

  const createTask = useCallback(
    (values: TaskFormValues) => {
      if (user?.role !== 'admin') throw new Error('Only the system administrator can create tasks.');
      const now = taskNowIso();
      const taskRecord: Task = {
        id: nextTaskId(tasks),
        ...toFields(values),
        createdByUserId: currentUser.id,
        createdAt: now,
        completedAt: values.status === 'completed' ? now : null
      };
      setTasks((current) => [...current, taskRecord]);
      log(taskRecord.id, 'created', 'Task created.');
      log(taskRecord.id, 'assigned', `Task assigned to ${nameOf(taskRecord.assignedEmployeeId)}.`);
      const employee = employees.find((item) => item.id === taskRecord.assignedEmployeeId);
      const recipient = employee?.userId;
      if (recipient) addNotification({ title: 'Task assigned', message: `${taskRecord.title} (${taskRecord.taskCode}) was assigned to you.`, type: 'task', recipientId: recipient, relatedEntityId: taskRecord.id, destination: '/my-tasks' });
      record({ actorId: user.id, actorName: user.name, actorRole: user.role, action: 'task created and assigned', module: 'Tasks', description: `Admin created and assigned “${taskRecord.title}”.`, relatedRecord: `${taskRecord.taskCode} · ${taskRecord.title}` });
      return taskRecord;
    },
    [tasks, log, nameOf, employees, addNotification, record, user]
  );

  const updateTask = useCallback(
    (id: string, values: TaskFormValues) => {
      if (user?.role !== 'admin') return;
      const existing = tasks.find((t) => t.id === id);
      if (!existing) return;
      const fields = toFields(values);
      setTasks((current) => current.map((t) => (t.id === id ? { ...t, ...fields, completedAt: fields.status === 'completed' ? t.completedAt ?? taskNowIso() : null } : t)));

      if (existing.assignedEmployeeId !== fields.assignedEmployeeId) {
        log(id, 'reassigned', `Task reassigned to ${nameOf(fields.assignedEmployeeId)}.`);
        const employee = employees.find((item) => item.id === fields.assignedEmployeeId);
        if (employee?.userId) addNotification({ title: 'Task assigned', message: `${existing.title} (${existing.taskCode}) was assigned to you.`, type: 'task', recipientId: employee.userId, relatedEntityId: id, destination: '/my-tasks' });
      }
      if (existing.status !== fields.status) {
        log(id, 'status_changed', `Status changed to ${taskStatusLabels[fields.status]}.`);
        const employee = employees.find((item) => item.id === existing.assignedEmployeeId);
        if (employee?.userId) addNotification({ title: fields.status === 'completed' ? 'Task completed' : 'Task updated', message: `${existing.title} (${existing.taskCode}) status changed to ${taskStatusLabels[fields.status]}.`, type: 'task', recipientId: employee.userId, relatedEntityId: id, destination: '/my-tasks' });
      }
      if (existing.priority !== fields.priority) {
        log(id, 'priority_changed', `Priority changed to ${taskPriorityLabels[fields.priority]}.`);
      }
      if (existing.progress !== fields.progress) {
        log(id, 'progress_updated', `Progress updated to ${fields.progress}%.`);
      }
      if (existing.startDate !== fields.startDate || existing.dueDate !== fields.dueDate) {
        log(id, 'deadline_updated', 'Task dates updated.');
      }
      record({ actorId: currentUser.id, actorName: currentUser.name, actorRole: currentUser.role, action: 'task updated', module: 'Tasks', description: `Admin updated “${existing.title}”.`, relatedRecord: `${existing.taskCode} · ${existing.title}` });
    },
    [tasks, log, nameOf, employees, addNotification, record, user]
  );

  const setTaskStatus = useCallback(
    (id: string, status: TaskStatus) => {
      if (user?.role !== 'admin') return;
      const existing = tasks.find((t) => t.id === id);
      if (!existing || existing.status === status) return;
      const { status: nextStatus, progress } = normalizeTaskProgress(status, existing.progress);
      setTasks((current) => current.map((t) => (t.id === id ? { ...t, status: nextStatus, progress, completedAt: nextStatus === 'completed' ? t.completedAt ?? taskNowIso() : null } : t)));
      log(id, 'status_changed', `Status changed to ${taskStatusLabels[nextStatus]}.`);
      if (progress !== existing.progress) log(id, 'progress_updated', `Progress updated to ${progress}%.`);
      const employee = employees.find((item) => item.id === existing.assignedEmployeeId);
      if (employee?.userId) addNotification({ title: nextStatus === 'completed' ? 'Task completed' : 'Task updated', message: `${existing.title} (${existing.taskCode}) status changed to ${taskStatusLabels[nextStatus]}.`, type: 'task', recipientId: employee.userId, relatedEntityId: id, destination: '/my-tasks' });
      record({ actorId: user?.id ?? currentUser.id, actorName: user?.name ?? currentUser.name, actorRole: user?.role ?? currentUser.role, action: 'task status changed', module: 'Tasks', description: `Task status changed to ${taskStatusLabels[nextStatus]}.`, relatedRecord: `${existing.taskCode} · ${existing.title}` });
    },
    [tasks, log, employees, addNotification, record, user]
  );

  const setTaskProgress = useCallback(
    (id: string, progress: number) => {
      if (user?.role !== 'admin') return;
      const existing = tasks.find((t) => t.id === id);
      if (!existing) return;
      const normalized = normalizeTaskProgress(existing.status, progress);
      setTasks((current) => current.map((t) => (t.id === id ? { ...t, ...normalized } : t)));
      log(id, 'progress_updated', `Progress updated to ${normalized.progress}%.`);
      if (normalized.status !== existing.status) {
        log(id, 'status_changed', `Status changed to ${taskStatusLabels[normalized.status]}.`);
      }
      if (normalized.progress !== existing.progress || normalized.status !== existing.status) record({ actorId: user?.id ?? currentUser.id, actorName: user?.name ?? currentUser.name, actorRole: user?.role ?? currentUser.role, action: 'task progress updated', module: 'Tasks', description: `Progress updated to ${normalized.progress}%.`, relatedRecord: `${existing.taskCode} · ${existing.title}` });
    },
    [tasks, log, record, user]
  );

  const updateAssignedTask = useCallback((id: string, status: TaskStatus, progress: number) => {
    if (user?.role !== 'employee') return false;
    const employee = employees.find((item) => item.userId === user.id);
    const existing = tasks.find((task) => task.id === id);
    if (!employee || !existing || existing.assignedEmployeeId !== employee.id) return false;
    if (!Number.isFinite(progress) || progress < 0 || progress > 100) return false;
    const normalized = normalizeTaskProgress(status, progress);
    setTasks((current) => current.map((task) => task.id === id ? {
      ...task,
      ...normalized,
      completedAt: normalized.status === 'completed' ? task.completedAt ?? taskNowIso() : null
    } : task));
    if (existing.status !== normalized.status) log(id, 'status_changed', `Status changed to ${taskStatusLabels[normalized.status]}.`);
    if (existing.progress !== normalized.progress) log(id, 'progress_updated', `Progress updated to ${normalized.progress}%.`);
    record({ actorId: user.id, actorName: user.name, actorRole: user.role, action: 'assigned task updated', module: 'Tasks', description: `Updated “${existing.title}” to ${taskStatusLabels[normalized.status]} at ${normalized.progress}%.`, relatedRecord: `${existing.taskCode} · ${existing.title}` });
    return true;
  }, [employees, log, record, tasks, user]);

  const reassignTask = useCallback(
    (id: string, employeeId: string) => {
      if (user?.role !== 'admin') return;
      const existing = tasks.find((t) => t.id === id);
      if (!existing || existing.assignedEmployeeId === employeeId) return;
      setTasks((current) => current.map((t) => (t.id === id ? { ...t, assignedEmployeeId: employeeId } : t)));
      log(id, 'reassigned', `Task reassigned to ${nameOf(employeeId)}.`);
      const employee = employees.find((item) => item.id === employeeId);
      if (employee?.userId) addNotification({ title: 'Task assigned', message: `${existing.title} (${existing.taskCode}) was assigned to you.`, type: 'task', recipientId: employee.userId, relatedEntityId: id, destination: '/my-tasks' });
      record({ actorId: currentUser.id, actorName: currentUser.name, actorRole: currentUser.role, action: 'task reassigned', module: 'Tasks', description: `Task reassigned to ${nameOf(employeeId)}.`, relatedRecord: `${existing.taskCode} · ${existing.title}` });
    },
    [tasks, log, nameOf, employees, addNotification, record, user]
  );

  const value = useMemo(
    () => ({ tasks, activities, createTask, updateTask, setTaskStatus, setTaskProgress, updateAssignedTask, reassignTask }),
    [tasks, activities, createTask, updateTask, setTaskStatus, setTaskProgress, updateAssignedTask, reassignTask]
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks(): TasksContextValue {
  const context = useContext(TasksContext);
  if (!context) throw new Error('useTasks must be used inside TasksProvider');
  return context;
}

/** For validation in forms — project membership from live project state. */
export function useProjectMembers(): ProjectMember[] {
  return useProjects().members;
}
