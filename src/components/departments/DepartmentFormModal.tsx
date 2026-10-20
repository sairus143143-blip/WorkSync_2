import React, { useEffect, useId, useState } from 'react';
import type { Department, DepartmentErrors, DepartmentInput, RecordStatus } from '../../types/organization';
import { validateDepartment } from '../../utils/organization';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';

interface DepartmentFormModalProps {
  open: boolean;
  editing?: Department;
  departments: Department[];
  onClose: () => void;
  onSubmit: (input: DepartmentInput) => void;
}

const empty: DepartmentInput = { name: '', code: '', description: '', status: 'active' };

export function DepartmentFormModal({ open, editing, departments, onClose, onSubmit }: DepartmentFormModalProps) {
  const [values, setValues] = useState<DepartmentInput>(empty);
  const [errors, setErrors] = useState<DepartmentErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const formId = useId();

  useEffect(() => {
    if (!open) return;
    setValues(editing ? { name: editing.name, code: editing.code, description: editing.description, status: editing.status } : empty);
    setErrors({});
    setSubmitted(false);
    setSaving(false);
  }, [open, editing]);

  const setField = <K extends keyof DepartmentInput,>(field: K, value: DepartmentInput[K]) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (submitted) setErrors(validateDepartment(next, departments, editing?.id));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    const nextErrors = validateDepartment(values, departments, editing?.id);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSaving(true);
    window.setTimeout(() => onSubmit(values), 400);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit department' : 'Add department'}
      description={editing ? `Department ID ${editing.id} stays the same.` : 'Create a new organizational department.'}
      footer={
      <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={saving}>
            {editing ? 'Save changes' : 'Create department'}
          </Button>
        </>
      }>
      
      <form id={formId} onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-3">
        <Input
          label="Department name"
          placeholder="Information Technology"
          value={values.name}
          onChange={(e) => setField('name', e.target.value)}
          error={errors.name}
          className="sm:col-span-2" />
        
        <Input
          label="Department code"
          placeholder="IT"
          value={values.code}
          onChange={(e) => setField('code', e.target.value.toUpperCase())}
          error={errors.code} />
        
        <Textarea
          label="Description"
          placeholder="Technology and technical support operations."
          value={values.description}
          onChange={(e) => setField('description', e.target.value)}
          error={errors.description}
          className="sm:col-span-3" />
        
        <Select
          label="Status"
          value={values.status}
          onChange={(e) => setField('status', e.target.value as RecordStatus | '')}
          error={errors.status}
          hint={values.status === 'inactive' && !errors.status ? 'Inactive departments can’t receive new employees or positions.' : undefined}
          className="sm:col-span-3"
          options={[
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' }]
          } />
        
      </form>
    </Modal>);

}