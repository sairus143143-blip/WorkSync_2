import React, { useId, useMemo, useState } from 'react';
import type { Department } from '../../types/organization';
import type { Project, ProjectFormValues, ProjectStatus } from '../../types/projects';
import { assignableDepartments } from '../../utils/employees';
import {
  DUPLICATE_CODE_MESSAGE,
  PROJECT_STATUSES,
  PROJECT_TODAY,
  formatProjectDate,
  nextProjectCode,
  projectStatusLabels } from
'../../utils/projects';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { useProjectForm } from './useProjectForm';
import { useSettings } from '../../contexts/SettingsContext';

interface ProjectFormModalProps {
  open: boolean;
  /** Present when editing. */
  project?: Project;
  projects: Project[];
  departments: Department[];
  onClose: () => void;
  onSubmit: (values: ProjectFormValues) => void;
  /** Called with a short message when submit is blocked. */
  onInvalid: (message: string) => void;
}

function initialValues(project: Project | undefined, projects: Project[]): ProjectFormValues {
  if (project) {
    return {
      name: project.name,
      code: project.code,
      description: project.description,
      departmentId: project.departmentId,
      startDate: project.startDate,
      deadline: project.deadline,
      status: project.status,
      progress: String(project.progress)
    };
  }
  return { name: '', code: nextProjectCode(projects), description: '', departmentId: '', startDate: PROJECT_TODAY, deadline: '', status: 'planning', progress: '0' };
}

export function ProjectFormModal({ open, project, projects, departments, onClose, onSubmit, onInvalid }: ProjectFormModalProps) {
  const { settings } = useSettings();
  const formId = useId();
  const [saving, setSaving] = useState(false);
  const resetKey = project?.id ?? 'new';
  // Recompute only when the dialog opens so the suggested code doesn't shift while typing.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initial = useMemo(() => {
    const values = initialValues(project, projects);
    return project ? values : { ...values, status: settings.defaultProjectStatus as ProjectStatus };
  }, [open, resetKey, settings.defaultProjectStatus]);
  const { values, errors, setField, validate } = useProjectForm({ open, initial, resetKey, projects, departments, editing: project });

  const departmentOptions = assignableDepartments(departments, project?.departmentId).map((d) => ({
    value: d.id,
    label: d.status === 'inactive' ? `${d.name} (Inactive)` : d.name
  }));
  const progressLocked = values.status === 'completed';
  const progressNumber = Math.min(100, Math.max(0, Number(values.progress) || 0));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      onInvalid(nextErrors.code === DUPLICATE_CODE_MESSAGE ? DUPLICATE_CODE_MESSAGE : 'Please complete all required fields.');
      return;
    }
    setSaving(true);
    window.setTimeout(() => {
      onSubmit(values);
      setSaving(false);
    }, 400);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={project ? 'Edit Project' : 'Create New Project'}
      description={
      project ?
      `Created by the system administrator on ${formatProjectDate(project.createdAt.slice(0, 10))}. Creator and created date can’t be changed.` :
      'The project is controlled by the WorkSync system administrator.'
      }
      footer={
      <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={saving}>
            {project ? 'Save Changes' : 'Create Project'}
          </Button>
        </>
      }>
      
      <form id={formId} onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Input label="Project name" value={values.name} onChange={(e) => setField('name', e.target.value)} error={errors.name} placeholder="e.g. Employee Attendance Upgrade" />
        <Input
          label="Project code"
          value={values.code}
          onChange={(e) => setField('code', e.target.value.toUpperCase())}
          error={errors.code}
          hint={!project ? 'Suggested next code. Must be unique.' : undefined} />
        
        <Textarea
          label="Description (optional)"
          value={values.description}
          onChange={(e) => setField('description', e.target.value)}
          className="sm:col-span-2"
          placeholder="What is this project about?" />
        
        <Select
          label="Department"
          value={values.departmentId}
          onChange={(e) => setField('departmentId', e.target.value)}
          error={errors.departmentId}
          options={[{ value: '', label: 'Select a department' }, ...departmentOptions]} />
        
        <Select
          label="Status"
          value={values.status}
          onChange={(e) => setField('status', e.target.value as ProjectStatus | '')}
          error={errors.status}
          options={[{ value: '', label: 'Select a status' }, ...PROJECT_STATUSES.map((s) => ({ value: s, label: projectStatusLabels[s] }))]} />
        
        <Input label="Start date" type="date" value={values.startDate} onChange={(e) => setField('startDate', e.target.value)} error={errors.startDate} />
        <Input
          label="Deadline"
          type="date"
          min={values.startDate || undefined}
          value={values.deadline}
          onChange={(e) => setField('deadline', e.target.value)}
          error={errors.deadline} />
        

        {project &&
        <div className="sm:col-span-2">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label htmlFor={`${formId}-progress-range`} className="text-[13px] font-medium text-ink">
                  Progress
                </label>
                <input
                id={`${formId}-progress-range`}
                type="range"
                min={0}
                max={100}
                step={1}
                value={progressNumber}
                disabled={progressLocked}
                onChange={(e) => setField('progress', e.target.value)}
                className="mt-3 block w-full cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-60" />
              
              </div>
              <Input
              label="Progress percentage"
              hideLabel
              type="number"
              min={0}
              max={100}
              step={1}
              inputMode="numeric"
              value={values.progress}
              disabled={progressLocked}
              onChange={(e) => setField('progress', e.target.value)}
              className="w-24"
              rightElement={<span className="pr-2 text-sm text-muted">%</span>} />
            
            </div>
            <p className={`mt-1.5 text-xs ${errors.progress ? 'text-danger' : 'text-muted'}`}>
              {errors.progress ?? (
            progressLocked ? 'Completed projects are always 100%.' : 'Set manually for now. Task-based progress comes with Task Management.')}
            </p>
          </div>
        }
      </form>
    </Modal>);

}
