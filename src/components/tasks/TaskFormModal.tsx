import React, { useId, useMemo, useState } from 'react';
import type { Employee } from '../../types/employees';
import type { Project, ProjectMember } from '../../types/projects';
import type { Task, TaskFormValues, TaskPriority, TaskStatus } from '../../types/tasks';
import { employeeFullName } from '../../utils/employees';
import {
  DUPLICATE_TASK_CODE_MESSAGE,
  TASK_PRIORITIES,
  TASK_STATUSES,
  activeMemberEmployeeIds,
  formatTaskDate,
  nextTaskCode,
  projectAcceptsNewTasks,
  taskPriorityLabels,
  taskStatusLabels
} from '../../utils/tasks';
import { PROJECT_TODAY } from '../../utils/projects';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { useTaskForm } from './useTaskForm';
import { useSettings } from '../../contexts/SettingsContext';

interface TaskFormModalProps {
  open: boolean;
  task?: Task;
  tasks: Task[];
  projects: Project[];
  members: ProjectMember[];
  employees: Employee[];
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => void;
  onInvalid: (message: string) => void;
}

function initialValues(task: Task | undefined, tasks: Task[]): TaskFormValues {
  if (task) {
    return {
      title: task.title,
      taskCode: task.taskCode,
      projectId: task.projectId,
      description: task.description ?? '',
      assignedEmployeeId: task.assignedEmployeeId,
      priority: task.priority,
      status: task.status,
      startDate: task.startDate,
      dueDate: task.dueDate,
      progress: String(task.progress)
    };
  }
  return {
    title: '',
    taskCode: nextTaskCode(tasks),
    projectId: '',
    description: '',
    assignedEmployeeId: '',
    priority: 'medium',
    status: 'todo',
    startDate: PROJECT_TODAY,
    dueDate: '',
    progress: '0'
  };
}

export function TaskFormModal({ open, task, tasks, projects, members, employees, onClose, onSubmit, onInvalid }: TaskFormModalProps) {
  const { settings } = useSettings();
  const formId = useId();
  const [saving, setSaving] = useState(false);
  const resetKey = task?.id ?? 'new';
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initial = useMemo(() => {
    const values = initialValues(task, tasks);
    return task ? values : { ...values, priority: settings.defaultTaskPriority as TaskPriority, status: settings.defaultTaskStatus as TaskStatus };
  }, [open, resetKey, settings.defaultTaskPriority, settings.defaultTaskStatus]);
  const { values, errors, setField, validate } = useTaskForm({ open, initial, resetKey, tasks, projects, members, employees, editing: task });

  const creatableProjects = projects.filter((p) => task || projectAcceptsNewTasks(p.status));
  const selectedProject = projects.find((p) => p.id === values.projectId);
  const memberIds = values.projectId ? activeMemberEmployeeIds(members, values.projectId) : [];
  const assignableEmployees = employees.filter((e) => memberIds.includes(e.id));
  const closedProjectSelected = !task && selectedProject && !projectAcceptsNewTasks(selectedProject.status);
  const noMembers = Boolean(values.projectId && memberIds.length === 0);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      const msg =
        nextErrors.taskCode === DUPLICATE_TASK_CODE_MESSAGE ? DUPLICATE_TASK_CODE_MESSAGE :
        nextErrors.projectId?.includes('completed') ? nextErrors.projectId :
        'Please complete all required fields.';
      onInvalid(msg);
      return;
    }
    setSaving(true);
    window.setTimeout(() => {
      onSubmit(values);
      setSaving(false);
    }, 350);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={task ? 'Edit Task' : 'Create Task'}
      description={task ? `Created ${formatTaskDate(task.createdAt.slice(0, 10))}. Creator and created date can’t be changed.` : 'Assign work to a project member.'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" form={formId} loading={saving} disabled={noMembers || closedProjectSelected}>
            {task ? 'Save Changes' : 'Create Task'}
          </Button>
        </>
      }>
      
      <form id={formId} onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Input label="Task Title" value={values.title} onChange={(e) => setField('title', e.target.value)} error={errors.title} required className="sm:col-span-2" />
        <Input label="Task Code" value={values.taskCode} onChange={(e) => setField('taskCode', e.target.value.toUpperCase())} error={errors.taskCode} required />
        <Select
          label="Project"
          value={values.projectId}
          onChange={(e) => setField('projectId', e.target.value)}
          error={errors.projectId}
          required
          options={[{ value: '', label: 'Select project' }, ...creatableProjects.map((p) => ({ value: p.id, label: p.name }))]} />
        
        {closedProjectSelected &&
          <p className="sm:col-span-2 text-sm text-danger" role="alert">
            Tasks cannot be added to a completed or cancelled project.
          </p>
        }
        {noMembers &&
          <p className="sm:col-span-2 text-sm text-warning" role="alert">
            No employees are assigned to this project. Add project members before creating a task.
          </p>
        }
        <Textarea label="Description" value={values.description} onChange={(e) => setField('description', e.target.value)} className="sm:col-span-2" rows={3} />
        <Select
          label="Assigned Employee"
          value={values.assignedEmployeeId}
          onChange={(e) => setField('assignedEmployeeId', e.target.value)}
          error={errors.assignedEmployeeId}
          required
          disabled={!values.projectId || noMembers}
          options={[
            { value: '', label: assignableEmployees.length ? 'Select employee' : 'No project members' },
            ...assignableEmployees.map((e) => ({ value: e.id, label: `${employeeFullName(e)} · ${e.employeeNumber}` }))
          ]} />
        
        <Select
          label="Priority"
          value={values.priority}
          onChange={(e) => setField('priority', e.target.value as TaskPriority)}
          error={errors.priority}
          required
          options={TASK_PRIORITIES.map((p) => ({ value: p, label: taskPriorityLabels[p] }))} />
        
        <Select
          label="Status"
          value={values.status}
          onChange={(e) => setField('status', e.target.value as TaskStatus)}
          error={errors.status}
          required
          options={TASK_STATUSES.map((s) => ({ value: s, label: taskStatusLabels[s] }))} />
        
        <Input label="Start Date" type="date" value={values.startDate} onChange={(e) => setField('startDate', e.target.value)} error={errors.startDate} required />
        <Input label="Due Date" type="date" value={values.dueDate} onChange={(e) => setField('dueDate', e.target.value)} error={errors.dueDate} required />
        <Input label="Progress (%)" type="number" min={0} max={100} value={values.progress} onChange={(e) => setField('progress', e.target.value)} error={errors.progress} required />
      </form>
    </Modal>
  );
}
