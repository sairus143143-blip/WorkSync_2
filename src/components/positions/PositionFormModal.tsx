import React, { useEffect, useId, useState } from 'react';
import type { Department, Position, PositionErrors, PositionInput, RecordStatus } from '../../types/organization';
import { findDepartment, suggestPositionCode, validatePosition } from '../../utils/organization';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';

interface PositionFormModalProps {
  open: boolean;
  editing?: Position;
  positions: Position[];
  departments: Department[];
  /** Pre-selects a department when adding (e.g. from the active filter). */
  defaultDepartmentId?: string;
  /** Employees currently holding the position being edited. */
  assignedEmployees?: number;
  onClose: () => void;
  onSubmit: (input: PositionInput) => void;
}

export function PositionFormModal({
  open,
  editing,
  positions,
  departments,
  defaultDepartmentId,
  assignedEmployees = 0,
  onClose,
  onSubmit
}: PositionFormModalProps) {
  const [values, setValues] = useState<PositionInput>({ name: '', code: '', departmentId: '', description: '', status: 'active' });
  const [errors, setErrors] = useState<PositionErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  /** While true, the code follows the selected department's next suggested code. */
  const [autoCode, setAutoCode] = useState(true);
  const formId = useId();

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setValues({ name: editing.name, code: editing.code, departmentId: editing.departmentId, description: editing.description, status: editing.status });
      setAutoCode(false);
    } else {
      const dept = findDepartment(departments, defaultDepartmentId ?? '');
      const departmentId = dept?.status === 'active' ? dept.id : '';
      setValues({ name: '', code: suggestPositionCode(positions, dept?.status === 'active' ? dept : undefined), departmentId, description: '', status: 'active' });
      setAutoCode(true);
    }
    setErrors({});
    setSubmitted(false);
    setSaving(false);
    // Reset only when the dialog opens or the target changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing]);

  const update = (next: PositionInput) => {
    setValues(next);
    if (submitted) setErrors(validatePosition(next, positions, departments, editing, assignedEmployees));
  };

  const setField = <K extends keyof PositionInput,>(field: K, value: PositionInput[K]) => {
    if (field === 'code') setAutoCode(false);
    const next = { ...values, [field]: value };
    if (field === 'departmentId' && autoCode) next.code = suggestPositionCode(positions, findDepartment(departments, value as string));
    update(next);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    const nextErrors = validatePosition(values, positions, departments, editing, assignedEmployees);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSaving(true);
    window.setTimeout(() => onSubmit(values), 400);
  };

  // Only active departments accept new positions; a position's current inactive department stays visible when editing.
  const departmentOptions = departments.filter((d) => d.status === 'active' || d.id === editing?.departmentId);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit position' : 'Add position'}
      description={editing ? `Position ID ${editing.id} stays the same.` : 'Create a position and assign it to a department.'}
      footer={
      <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={saving}>
            {editing ? 'Save changes' : 'Create position'}
          </Button>
        </>
      }>
      
      <form id={formId} onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Department"
          value={values.departmentId}
          onChange={(e) => setField('departmentId', e.target.value)}
          error={errors.departmentId}
          hint={
          !errors.departmentId && editing && assignedEmployees > 0 ?
          'Positions with assigned employees stay in their department.' :
          undefined
          }
          className="sm:col-span-2"
          options={[
          { value: '', label: 'Select a department' },
          ...departmentOptions.map((d) => ({ value: d.id, label: d.status === 'inactive' ? `${d.name} (Inactive)` : d.name }))]
          } />
        
        <Input
          label="Position name"
          placeholder="IT Support Specialist"
          value={values.name}
          onChange={(e) => setField('name', e.target.value)}
          error={errors.name} />
        
        <Input
          label="Position code"
          placeholder="POS-IT-001"
          value={values.code}
          onChange={(e) => setField('code', e.target.value.toUpperCase())}
          error={errors.code}
          hint={!errors.code && !editing && autoCode && values.code ? 'Suggested from the department code.' : undefined} />
        
        <Textarea
          label="Description"
          placeholder="Provides technical support to employees."
          value={values.description}
          onChange={(e) => setField('description', e.target.value)}
          error={errors.description}
          className="sm:col-span-2" />
        
        <Select
          label="Status"
          value={values.status}
          onChange={(e) => setField('status', e.target.value as RecordStatus | '')}
          error={errors.status}
          hint={values.status === 'inactive' && !errors.status ? 'Inactive positions can’t be used for new employee assignments.' : undefined}
          className="sm:col-span-2"
          options={[
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' }]
          } />
        
      </form>
    </Modal>);

}