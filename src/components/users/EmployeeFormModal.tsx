import React, { useEffect, useId, useState } from 'react';
import { ImagePlusIcon, InfoIcon } from 'lucide-react';
import type { AccountStatus, EmployeeAccountInput, SystemUser } from '../../types/users';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { useEmployeeForm } from './useEmployeeForm';

interface EmployeeFormModalProps {
  open: boolean;
  /** Present when editing an existing employee. */
  editing?: SystemUser;
  users: SystemUser[];
  onClose: () => void;
  onSubmit: (input: EmployeeAccountInput) => void;
}

export function EmployeeFormModal({ open, editing, users, onClose, onSubmit }: EmployeeFormModalProps) {
  const { values, errors, setField, validate } = useEmployeeForm(open, users, editing);
  const [saving, setSaving] = useState(false);
  const formId = useId();
  const fileId = useId();
  const isEdit = Boolean(editing);

  useEffect(() => {
    if (open) setSaving(false);
  }, [open]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setSaving(true);
    window.setTimeout(() => onSubmit(values), 500);
  };

  const onImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setField('avatarUrl', URL.createObjectURL(file));
    event.target.value = '';
  };

  const previewName = `${values.firstName} ${values.lastName}`.trim() || 'New Employee';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit employee' : 'Add employee'}
      description={isEdit ? `Update account details for ${editing?.firstName} ${editing?.lastName}.` : 'Create a new employee account for WorkSync.'}
      footer={
      <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={saving}>
            {isEdit ? 'Save changes' : 'Create employee'}
          </Button>
        </>
      }>
      
      <form id={formId} onSubmit={submit} noValidate className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar name={previewName} src={values.avatarUrl} size="lg" />
          <div>
            <p className="text-[13px] font-medium text-ink">
              Profile image <span className="font-normal text-subtle">(optional)</span>
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <label
                htmlFor={fileId}
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-[13px] font-medium text-ink transition-colors duration-150 hover:bg-ink/[0.03] focus-within:ring-2 focus-within:ring-primary/40">
                
                <ImagePlusIcon className="h-4 w-4" aria-hidden />
                {values.avatarUrl ? 'Change photo' : 'Upload photo'}
                <input id={fileId} type="file" accept="image/*" className="sr-only" onChange={onImage} />
              </label>
              {values.avatarUrl &&
              <Button variant="ghost" size="sm" onClick={() => setField('avatarUrl', undefined)}>
                  Remove
                </Button>
              }
            </div>
            <p className="mt-1 text-xs text-muted">Initials are used when no photo is set.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="First name" autoComplete="given-name" value={values.firstName} onChange={(e) => setField('firstName', e.target.value)} error={errors.firstName} />
          <Input label="Last name" autoComplete="family-name" value={values.lastName} onChange={(e) => setField('lastName', e.target.value)} error={errors.lastName} />
        </div>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="name@worksync.test"
          value={values.email}
          onChange={(e) => setField('email', e.target.value)}
          error={errors.email} />
        
        <Select
          label="Status"
          value={values.status}
          onChange={(e) => setField('status', e.target.value as AccountStatus)}
          error={errors.status}
          hint={values.status === 'inactive' ? 'Inactive employees cannot sign in.' : undefined}
          options={[
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' }]
          } />
        

        <div className="flex items-start gap-2.5 rounded-lg bg-bg px-3 py-2.5 text-[13px] text-muted">
          <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-subtle" aria-hidden />
          <p>
            Role: <span className="font-medium text-ink">Employee</span> — assigned automatically. WorkSync has one protected
            system administrator, so administrator access can't be granted.
          </p>
        </div>
      </form>
    </Modal>);

}