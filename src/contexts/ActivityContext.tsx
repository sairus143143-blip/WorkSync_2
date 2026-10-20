import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { currentUser } from '../data/currentUser';
import { projectActivities } from '../data/projectActivities';
import { taskActivities } from '../data/taskActivity';
import { projects } from '../data/projects';
import { tasks } from '../data/tasks';
import { users } from '../data/users';
import type { ActivityLog, ActivityModule } from '../types/notifications';

function makeMockLogs(): ActivityLog[] {
  const taskLogs: ActivityLog[] = taskActivities.flatMap((activity) => {
    const task = tasks.find((item) => item.id === activity.taskId);
    if (!task) return [];
    const actor = users.find((item) => item.id === activity.createdByUserId);
    return [{ id: activity.id, actorId: activity.createdByUserId, actorName: actor ? `${actor.firstName} ${actor.lastName}` : 'Unknown user', actorRole: actor?.role ?? 'employee', action: activity.type.replace(/_/g, ' '), module: 'Tasks', description: activity.description, relatedRecord: `${task.taskCode} · ${task.title}`, timestamp: activity.createdAt, mock: true }];
  });
  const projectLogs: ActivityLog[] = projectActivities.flatMap((activity) => {
    const project = projects.find((item) => item.id === activity.projectId);
    if (!project) return [];
    const actor = users.find((item) => item.id === activity.performedBy);
    return [{ id: activity.id, actorId: activity.performedBy, actorName: actor ? `${actor.firstName} ${actor.lastName}` : 'Unknown user', actorRole: actor?.role ?? 'admin', action: activity.action.replace(/_/g, ' '), module: 'Projects', description: activity.description, relatedRecord: `${project.code} · ${project.name}`, timestamp: activity.createdAt, mock: true }];
  });
  return [...taskLogs, ...projectLogs];
}

type ActivityLogInput = Omit<ActivityLog, 'id' | 'timestamp' | 'actorId' | 'actorName' | 'actorRole'> & Partial<Pick<ActivityLog, 'actorId' | 'actorName' | 'actorRole'>>;
interface ActivityContextValue { logs: ActivityLog[]; record: (input: ActivityLogInput) => void; }
const ActivityContext = createContext<ActivityContextValue | null>(null);

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<ActivityLog[]>(makeMockLogs);
  const count = useRef(1);
  const record = useCallback((input: ActivityLogInput) => {
    const entry: ActivityLog = { ...input, id: `LIVE-${String(count.current++).padStart(4, '0')}`, timestamp: new Date().toISOString(), actorId: input.actorId ?? currentUser.id, actorName: input.actorName ?? currentUser.name, actorRole: input.actorRole ?? currentUser.role };
    setLogs((current) => [entry, ...current]);
  }, []);
  const value = useMemo(() => ({ logs, record }), [logs, record]);
  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (!context) throw new Error('useActivity must be used inside ActivityProvider');
  return context;
}

export function activityModule(value: string): ActivityModule {
  return (['Tasks', 'Projects', 'Users', 'Employees', 'Departments', 'Positions', 'Attendance', 'Reports'] as const).includes(value as ActivityModule) ? value as ActivityModule : 'Tasks';
}
