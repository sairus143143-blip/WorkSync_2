import { useEffect, useState } from 'react';
import type { Employee } from '../../types/employees';
import type { Project, ProjectMember } from '../../types/projects';
import type { Task, TaskFormErrors, TaskFormValues } from '../../types/tasks';
import { validateTaskForm } from '../../utils/tasks';

interface Options {
  open: boolean;
  initial: TaskFormValues;
  resetKey: string;
  tasks: Task[];
  projects: Project[];
  members: ProjectMember[];
  employees: Employee[];
  editing?: Task;
}

export function useTaskForm({ open, initial, resetKey, tasks, projects, members, employees, editing }: Options) {
  const [values, setValues] = useState<TaskFormValues>(initial);
  const [errors, setErrors] = useState<TaskFormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(initial);
    setErrors({});
    setSubmitted(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, resetKey]);

  const ctx = { tasks, projects, members, employees, editing };

  const setField = <K extends keyof TaskFormValues>(field: K, value: TaskFormValues[K]) => {
    const next = { ...values, [field]: value };
    if (field === 'projectId' && value !== values.projectId) next.assignedEmployeeId = '';
    if (field === 'status' && value === 'completed') next.progress = '100';
    if (field === 'progress' && Number(value) === 100) next.status = 'completed';
    setValues(next);
    if (submitted) setErrors(validateTaskForm(next, ctx));
  };

  const validate = () => {
    setSubmitted(true);
    const nextErrors = validateTaskForm(values, ctx);
    setErrors(nextErrors);
    return nextErrors;
  };

  return { values, errors, setField, validate };
}
