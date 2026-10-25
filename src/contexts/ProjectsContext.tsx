import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { currentUser } from '../data/currentUser';
import { projectActivities as seedActivities } from '../data/projectActivities';
import { projectMembers as seedMembers } from '../data/projectMembers';
import { projects as seedProjects } from '../data/projects';
import type { Project, ProjectActivity, ProjectActivityAction, ProjectFormValues, ProjectMember, ProjectStatus } from '../types/projects';
import { employeeFullName } from '../utils/employees';
import { nextProjectId, projectNowIso, projectStatusLabels } from '../utils/projects';
import { useEmployees } from './EmployeesContext';

interface ProjectsContextValue {
  projects: Project[];
  members: ProjectMember[];
  activities: ProjectActivity[];
  createProject: (values: ProjectFormValues) => Project;
  updateProject: (id: string, values: ProjectFormValues) => void;
  setProjectStatus: (id: string, status: ProjectStatus) => void;
  /** Adds employees to a project. Previously removed memberships are restored. */
  addMembers: (projectId: string, employeeIds: string[]) => void;
  /** Ends the project relationship only — the employee record is untouched. */
  removeMember: (memberId: string) => void;
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

function listNames(names: string[]): string {
  if (names.length <= 2) return names.join(' and ');
  return `${names.length} employees`;
}

function toFields(values: ProjectFormValues) {
  const status = values.status as ProjectStatus;
  return {
    name: values.name.trim(),
    code: values.code.trim().toUpperCase(),
    description: values.description.trim(),
    startDate: values.startDate,
    deadline: values.deadline,
    status,
    // A completed project is always 100%.
    progress: status === 'completed' ? 100 : Number(values.progress)
  };
}

/**
 * Mock project store. Every change is made by the single system administrator and
 * recorded in the activity log. Projects and memberships are never deleted.
 */
export function ProjectsProvider({ children }: {children: React.ReactNode;}) {
  const { employees } = useEmployees();
  const [projects, setProjects] = useState<Project[]>(seedProjects);
  const [members, setMembers] = useState<ProjectMember[]>(seedMembers);
  const [activities, setActivities] = useState<ProjectActivity[]>(seedActivities);
  const counter = useRef({ activity: seedActivities.length + 1, member: seedMembers.length + 1 });

  const log = useCallback((projectId: string, entries: Array<[ProjectActivityAction, string]>) => {
    if (entries.length === 0) return;
    const createdAt = projectNowIso();
    const records = entries.map(([action, description]) => ({
      id: `ACT-${String(counter.current.activity++).padStart(3, '0')}`,
      projectId,
      action,
      description,
      performedBy: currentUser.id,
      createdAt
    }));
    setActivities((current) => [...current, ...records]);
  }, []);

  const nameOf = useCallback(
    (employeeId: string) => {
      const e = employees.find((x) => x.id === employeeId);
      return e ? employeeFullName(e) : 'an employee';
    },
    [employees]
  );

  const createProject = useCallback(
    (values: ProjectFormValues) => {
      const now = projectNowIso();
      const record: Project = { id: nextProjectId(projects), ...toFields(values), createdBy: currentUser.id, createdAt: now, updatedAt: now };
      setProjects((current) => [...current, record]);
      log(record.id, [['project_created', 'Admin created the project.']]);
      return record;
    },
    [projects, log]
  );

  const updateProject = useCallback(
    (id: string, values: ProjectFormValues) => {
      const existing = projects.find((p) => p.id === id);
      if (!existing) return;
      const fields = toFields(values);
      setProjects((current) => current.map((p) => p.id === id ? { ...p, ...fields, updatedAt: projectNowIso() } : p));

      const entries: Array<[ProjectActivityAction, string]> = [];
      const detailsChanged = (['name', 'code', 'description', 'startDate', 'deadline'] as const).some(
        (key) => existing[key] !== fields[key]
      );
      if (detailsChanged) entries.push(['project_updated', 'Admin updated the project details.']);
      if (existing.status !== fields.status) entries.push(['status_changed', `Admin changed status to ${projectStatusLabels[fields.status]}.`]);
      if (existing.progress !== fields.progress) entries.push(['progress_updated', `Admin updated project progress to ${fields.progress}%.`]);
      log(id, entries);
    },
    [projects, log]
  );

  const setProjectStatus = useCallback(
    (id: string, status: ProjectStatus) => {
      const existing = projects.find((p) => p.id === id);
      if (!existing || existing.status === status) return;
      const progress = status === 'completed' ? 100 : existing.progress;
      setProjects((current) => current.map((p) => p.id === id ? { ...p, status, progress, updatedAt: projectNowIso() } : p));
      const entries: Array<[ProjectActivityAction, string]> = [['status_changed', `Admin changed status to ${projectStatusLabels[status]}.`]];
      if (progress !== existing.progress) entries.push(['progress_updated', `Admin updated project progress to ${progress}%.`]);
      log(id, entries);
    },
    [projects, log]
  );

  const addMembers = useCallback(
    (projectId: string, employeeIds: string[]) => {
      const now = projectNowIso();
      const ids = employeeIds.filter((employeeId) => !members.some((m) => m.projectId === projectId && m.employeeId === employeeId && m.status === 'active'));
      if (ids.length === 0) return;
      setMembers((current) => {
        const next = [...current];
        for (const employeeId of ids) {
          const previous = next.findIndex((m) => m.projectId === projectId && m.employeeId === employeeId);
          if (previous >= 0) next[previous] = { ...next[previous], status: 'active', assignedAt: now };else
          next.push({ id: `PM-${String(counter.current.member++).padStart(3, '0')}`, projectId, employeeId, assignedAt: now, status: 'active' });
        }
        return next;
      });
      setProjects((current) => current.map((p) => p.id === projectId ? { ...p, updatedAt: now } : p));
      log(projectId, [['member_added', `Admin assigned ${listNames(ids.map(nameOf))}.`]]);
    },
    [members, log, nameOf]
  );

  const removeMember = useCallback(
    (memberId: string) => {
      const member = members.find((m) => m.id === memberId);
      if (!member) return;
      setMembers((current) => current.map((m) => m.id === memberId ? { ...m, status: 'removed' } : m));
      setProjects((current) => current.map((p) => p.id === member.projectId ? { ...p, updatedAt: projectNowIso() } : p));
      log(member.projectId, [['member_removed', `Admin removed ${nameOf(member.employeeId)}.`]]);
    },
    [members, log, nameOf]
  );

  const value = useMemo(
    () => ({ projects, members, activities, createProject, updateProject, setProjectStatus, addMembers, removeMember }),
    [projects, members, activities, createProject, updateProject, setProjectStatus, addMembers, removeMember]
  );
  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects(): ProjectsContextValue {
  const context = useContext(ProjectsContext);
  if (!context) throw new Error('useProjects must be used inside ProjectsProvider');
  return context;
}