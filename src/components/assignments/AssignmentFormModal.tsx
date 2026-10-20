import React, { useEffect, useId, useState } from 'react';
import { ShieldCheckIcon } from 'lucide-react';
import type { AdminArea, AssignmentErrors, AssignmentInput, AssignmentRow, AssignmentStatus, PositionAdminAssignment } from '../../types/assignments';
import type { Department, Position } from '../../types/organization';
import { suggestAdminArea, validateAssignment } from '../../utils/assignments';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';

interface AssignmentFormModalProps {
  /** The position row being assigned or edited; null when closed. */
  row: AssignmentRow | null;
  positions: Position[];
  departments: Department[];
  adminAreas: AdminArea[];
  assignments: PositionAdminAssignment[];
  onClose: () => void;
  onSubmit: (input: AssignmentInput) => void;
}

export function AssignmentFormModal({ row, positions, departments, adminAreas, assignments, onClose, onSubmit }: AssignmentFormModalProps) {
  const [values, setValues] = useState<AssignmentInput>({ positionId: '', departmentId: '', adminAreaId: '', status: 'assigned' });
  const [errors, setErrors] = useState<AssignmentErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shown, setShown] = useState<AssignmentRow | null>(row);
  const formId = useId();

  if (row && row !== shown) setShown(row);
  const current = row ?? shown;
  const editing = current?.assignment;

  useEffect(() => {
    if (!row) return;
    // Department is always resolved from the position, keeping the relationship valid.
    setValues({
      positionId: row.position.id,
      departmentId: row.position.departmentId,
      adminAreaId: row.assignment?.adminAreaId ?? suggestAdminArea(adminAreas, row.department),
      status: row.assignment?.status ?? 'assigned'
    });
    setErrors({});
    setSubmitted(false);
    setSaving(false);
    // Reset only when a different row opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row?.position.id, row !== null]);

  const ctx = { positions, departments, adminAreas, assignments, editing };

  const setField = <K extends keyof AssignmentInput,>(field: K, value: AssignmentInput[K]) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (submitted) setErrors(validateAssignment(next, ctx));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    const nextErrors = validateAssignment(values, ctx);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSaving(true);
    window.setTimeout(() => onSubmit(values), 400);
  };

  const referenceError = errors.positionId ?? errors.departmentId;

  return (
    <Modal
      open={row !== null}
      onClose={onClose}
      title={editing ? 'Edit assignment' : 'Assign responsibility'}
      description="Define which administrative area is responsible for this position."
      footer={
      <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={saving}>
            Save Assignment
          </Button>
        </>
      }>
      
      {current &&
      <form id={formId} onSubmit={submit} noValidate className="space-y-4">
          <section aria-label="Position reference" className="rounded-lg border border-line bg-bg px-4 py-3">
            <dl className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted">Position</dt>
                <dd className="mt-0.5 flex flex-wrap items-center gap-2 text-sm font-medium text-ink">
                  {current.position.name}
                  {current.position.status === 'inactive' && <Badge>Inactive</Badge>}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Position code</dt>
                <dd className="mt-0.5 text-sm font-medium tabular-nums text-ink">{current.position.code}</dd>
              </div>
              <div className="sm:col-span-3">
                <dt className="text-xs text-muted">Department</dt>
                <dd className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-ink">
                  {current.department?.name ?? 'Unknown department'}
                  {current.department?.status === 'inactive' && <Badge>Inactive</Badge>}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-muted">Position and department are managed in Position Management.</p>
          </section>
          {referenceError &&
        <p role="alert" className="text-[13px] text-danger">
              {referenceError}
            </p>
        }

          <Select
          label="Responsible administrative area"
          value={values.adminAreaId}
          onChange={(e) => setField('adminAreaId', e.target.value)}
          error={errors.adminAreaId}
          options={[{ value: '', label: 'Select an administrative area' }, ...adminAreas.map((a) => ({ value: a.id, label: a.name }))]} />
        
          <Select
          label="Assignment status"
          value={values.status}
          onChange={(e) => setField('status', e.target.value as AssignmentStatus | '')}
          error={errors.status}
          options={[
          { value: 'assigned', label: 'Assigned' },
          { value: 'inactive', label: 'Inactive' }]
          } />
        

          <p className="flex items-start gap-2 text-[13px] text-muted">
            <ShieldCheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            Controlled by the System Administrator. This does not create an administrator account.
          </p>
        </form>
      }
    </Modal>);

}