import { useEffect, useState } from 'react';
import type { Project, ProjectFormErrors, ProjectFormValues } from '../../types/projects';
import { validateProject } from '../../utils/projects';

interface Options {
  open: boolean;
  initial: ProjectFormValues;
  resetKey: string;
  projects: Project[];
  editing?: Project;
}

/** Form state for Create / Edit Project. Completing a project locks progress at 100%. */
export function useProjectForm({ open, initial, resetKey, projects, editing }: Options) {
  const [values, setValues] = useState<ProjectFormValues>(initial);
  const [errors, setErrors] = useState<ProjectFormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(initial);
    setErrors({});
    setSubmitted(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, resetKey]);

  const ctx = { projects, editing };

  const setField = <K extends keyof ProjectFormValues,>(field: K, value: ProjectFormValues[K]) => {
    const next = { ...values, [field]: value };
    if (field === 'status' && value === 'completed') next.progress = '100';
    setValues(next);
    if (submitted) setErrors(validateProject(next, ctx));
  };

  const validate = () => {
    setSubmitted(true);
    const nextErrors = validateProject(values, ctx);
    setErrors(nextErrors);
    return nextErrors;
  };

  return { values, errors, setField, validate };
}