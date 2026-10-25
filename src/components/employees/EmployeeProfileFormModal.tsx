import React, { useEffect, useId, useState } from 'react';
import { ImagePlusIcon, InfoIcon } from 'lucide-react';
import type { Employee, EmployeeFormValues, EmployeeView, EmploymentStatus } from '../../types/employees';
import type { Position } from '../../types/organization';
import type { SystemUser } from '../../types/users';
import { assignablePositions } from '../../utils/employees';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { useEmployeeProfileForm } from './useEmployeeProfileForm';

interface EmployeeProfileFormModalProps {
  open: boolean;
  editing?: EmployeeView;
  employees: Employee[];
  users: SystemUser[];
  positions: Position[];
  suggestedNumber: string;
  onClose: () => void;
  onSubmit: (values: EmployeeFormValues) => void;
}

function FormSection({ title, description, children }: {title: string;description: string;children: React.ReactNode;}) {
  return (
    <fieldset className="border-t border-line pt-5 first:border-t-0 first:pt-0">
      <legend className="sr-only">{title}</legend>
      <h3 className="text-sm font-semibold text-ink" aria-hidden>
        {title}
      </h3>
      <p className="mt-0.5 text-[13px] text-muted">{description}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>);

}

export function EmployeeProfileFormModal(props: EmployeeProfileFormModalProps) {
  const { open, editing, onClose, onSubmit } = props;
  const { values, errors, setField, validate } = useEmployeeProfileForm(props);
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
    if (file) setField('avatar', URL.createObjectURL(file));
    event.target.value = '';
  };

  const positionOptions = assignablePositions(props.positions, editing?.employee.positionId);
  const withInactiveTag = (r: {name: string;status: string;}) => r.status === 'inactive' ? `${r.name} (Inactive)` : r.name;
  const previewName = `${values.firstName} ${values.lastName}`.trim() || 'New Employee';

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isEdit ? 'Edit employee' : 'Add employee'}
      description={
      isEdit ?
      `Update the workforce profile for ${editing?.fullName}.` :
      'Creates an employee profile and its linked Employee user account.'
      }
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
      
      <form id={formId} onSubmit={submit} noValidate className="space-y-5">
        <FormSection title="Account information" description="Used to sign in to WorkSync.">
          <Input
            label="Email"
            type="email"
            autoComplete="off"
            placeholder="name@worksync.test"
            value={values.email}
            onChange={(e) => setField('email', e.target.value)}
            error={errors.email}
            className="sm:col-span-2" />
          
          {!isEdit &&
          <>
              <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              value={values.password}
              onChange={(e) => setField('password', e.target.value)}
              error={errors.password}
              hint={errors.password ? undefined : 'At least 8 characters. Stored as mock data only.'} />
            
              <Input
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              value={values.confirmPassword}
              onChange={(e) => setField('confirmPassword', e.target.value)}
              error={errors.confirmPassword} />
            
            </>
          }
          <div className="flex items-start gap-2.5 rounded-lg bg-bg px-3 py-2.5 text-[13px] text-muted sm:col-span-2">
            <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-subtle" aria-hidden />
            <p>
              Role: <span className="font-medium text-ink">Employee</span> — assigned automatically.
              {isEdit && ' Account access is managed in User Management.'}
            </p>
          </div>
        </FormSection>

        <FormSection title="Personal information" description="Name and contact details.">
          <div className="flex items-center gap-4 sm:col-span-2">
            <Avatar name={previewName} src={values.avatar ?? undefined} size="lg" />
            <div>
              <p className="text-[13px] font-medium text-ink">
                Profile image <span className="font-normal text-subtle">(optional)</span>
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <label
                  htmlFor={fileId}
                  className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-[13px] font-medium text-ink transition-colors duration-150 hover:bg-ink/[0.03] focus-within:ring-2 focus-within:ring-primary/40">
                  
                  <ImagePlusIcon className="h-4 w-4" aria-hidden />
                  {values.avatar ? 'Change photo' : 'Upload photo'}
                  <input id={fileId} type="file" accept="image/*" className="sr-only" onChange={onImage} />
                </label>
                {values.avatar &&
                <Button variant="ghost" size="sm" onClick={() => setField('avatar', null)}>
                    Remove
                  </Button>
                }
              </div>
            </div>
          </div>
          <Input label="First name" value={values.firstName} onChange={(e) => setField('firstName', e.target.value)} error={errors.firstName} />
          <Input label="Last name" value={values.lastName} onChange={(e) => setField('lastName', e.target.value)} error={errors.lastName} />
          <Input
            label="Middle name"
            hint="Optional"
            value={values.middleName}
            onChange={(e) => setField('middleName', e.target.value)} />
          
          <Input
            label="Phone number"
            type="tel"
            placeholder="09171234567"
            value={values.phone}
            onChange={(e) => setField('phone', e.target.value)}
            error={errors.phone} />
          
          <Input
            label="Address"
            placeholder="City, Province"
            value={values.address}
            onChange={(e) => setField('address', e.target.value)}
            className="sm:col-span-2" />
          
        </FormSection>

        <FormSection title="Employment information" description="Workforce record details.">
          <Input
            label="Employee number"
            value={values.employeeNumber}
            onChange={(e) => setField('employeeNumber', e.target.value)}
            error={errors.employeeNumber} />
          
          <Input label="Date hired" type="date" value={values.dateHired} onChange={(e) => setField('dateHired', e.target.value)} error={errors.dateHired} />
          <Select
            label="Position"
            value={values.positionId}
            onChange={(e) => setField('positionId', e.target.value)}
            error={errors.positionId}
            hint={!errors.positionId && positionOptions.length === 0 ? 'No active positions are available.' : undefined}
            options={[
            { value: '', label: 'No position selected' },
            ...positionOptions.map((p) => ({ value: p.id, label: withInactiveTag(p) }))]
            } />
          
          <Select
            label="Employment status"
            value={values.employmentStatus}
            onChange={(e) => setField('employmentStatus', e.target.value as EmploymentStatus | '')}
            error={errors.employmentStatus}
            options={[
            { value: '', label: 'Select a status' },
            { value: 'active', label: 'Active' },
            { value: 'on_leave', label: 'On Leave' },
            { value: 'inactive', label: 'Inactive' }]
            } />
          
        </FormSection>
      </form>
    </Modal>);

}