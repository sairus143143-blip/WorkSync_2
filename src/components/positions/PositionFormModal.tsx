import React, { useEffect, useId, useState } from 'react';
import type { Position, PositionErrors, PositionInput, RecordStatus } from '../../types/organization';
import { suggestPositionCode, validatePosition } from '../../utils/organization';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';

interface PositionFormModalProps {
  open: boolean;
  editing?: Position;
  positions: Position[];
  onClose: () => void;
  onSubmit: (input: PositionInput) => void;
}

export function PositionFormModal({
  open,
  editing,
  positions,
  onClose,
  onSubmit
}: PositionFormModalProps) {
  const [values, setValues] = useState<PositionInput>({ name: '', code: '', description: '', status: 'active' });
  const [errors, setErrors] = useState<PositionErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const formId = useId();

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setValues({ name: editing.name, code: editing.code, description: editing.description, status: editing.status });
    } else {
      setValues({ name: '', code: suggestPositionCode(positions), description: '', status: 'active' });
    }
    setErrors({});
    setSubmitted(false);
    setSaving(false);
    // Reset only when the dialog opens or the target changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing]);

  const update = (next: PositionInput) => {
    setValues(next);
    if (submitted) setErrors(validatePosition(next, positions, editing?.id));
  };

  const setField = <K extends keyof PositionInput,>(field: K, value: PositionInput[K]) => {
    const next = { ...values, [field]: value };
    update(next);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    const nextErrors = validatePosition(values, positions, editing?.id);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSaving(true);
    window.setTimeout(() => onSubmit(values), 400);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit position' : 'Add position'}
      description={editing ? `Position ID ${editing.id} stays the same.` : 'Create a standalone job title for employee profiles.'}
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
          hint={!errors.code && !editing && values.code ? 'Suggested next position code.' : undefined} />
        
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