import React, { useState } from 'react';
import { useOrganization } from '../../contexts/OrganizationContext';
import { useProjects } from '../../contexts/ProjectsContext';
import { useToast } from '../../contexts/ToastContext';
import type { Project, ProjectFormValues, ProjectStatus } from '../../types/projects';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ProjectFormModal } from './ProjectFormModal';
import { ProjectStatusDialog } from './ProjectStatusDialog';

type FormState = {mode: 'create';} | {mode: 'edit';projectId: string;} | null;

/**
 * Create / Edit / Change Status flows shared by the project list and the details page.
 * Editing a completed project asks for confirmation first.
 */
export function useProjectActions(options: {onCreated?: (project: Project) => void;} = {}) {
  const { projects, createProject, updateProject, setProjectStatus } = useProjects();
  const { departments } = useOrganization();
  const { toast } = useToast();

  const [form, setForm] = useState<FormState>(null);
  const [statusProjectId, setStatusProjectId] = useState<string | null>(null);
  const [confirmEditId, setConfirmEditId] = useState<string | null>(null);

  const editing = form?.mode === 'edit' ? projects.find((p) => p.id === form.projectId) : undefined;
  const statusProject = statusProjectId ? projects.find((p) => p.id === statusProjectId) ?? null : null;
  const confirmEditProject = confirmEditId ? projects.find((p) => p.id === confirmEditId) : undefined;

  const openCreate = () => setForm({ mode: 'create' });
  const openEdit = (project: Project) => {
    if (project.status === 'completed') setConfirmEditId(project.id);else
    setForm({ mode: 'edit', projectId: project.id });
  };
  const openStatus = (project: Project) => setStatusProjectId(project.id);

  const submitForm = (values: ProjectFormValues) => {
    if (editing) {
      updateProject(editing.id, values);
      toast({ title: 'Project updated successfully.' });
    } else {
      const created = createProject(values);
      toast({ title: 'Project created successfully.', description: `${created.code} · ${created.name}` });
      options.onCreated?.(created);
    }
    setForm(null);
  };

  const confirmStatus = (project: Project, status: ProjectStatus) => {
    setProjectStatus(project.id, status);
    setStatusProjectId(null);
    toast({ title: 'Project status updated successfully.' });
  };

  const dialogs =
  <>
      <ProjectFormModal
      open={form !== null}
      project={editing}
      projects={projects}
      departments={departments}
      onClose={() => setForm(null)}
      onSubmit={submitForm}
      onInvalid={(message) => toast({ tone: 'error', title: message })} />
    
      <ProjectStatusDialog project={statusProject} onClose={() => setStatusProjectId(null)} onConfirm={confirmStatus} />
      <ConfirmDialog
      request={
      confirmEditProject ?
      {
        title: 'Edit a completed project?',
        message: `${confirmEditProject.name} is completed. Changes will alter its historical record.`,
        confirmLabel: 'Edit anyway'
      } :
      null
      }
      onClose={() => setConfirmEditId(null)}
      onConfirm={() => {
        if (confirmEditId) setForm({ mode: 'edit', projectId: confirmEditId });
        setConfirmEditId(null);
      }} />
    
    </>;


  return { openCreate, openEdit, openStatus, dialogs };
}