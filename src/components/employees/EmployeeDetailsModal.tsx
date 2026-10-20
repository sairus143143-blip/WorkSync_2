import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import type { EmployeeView } from '../../types/employees';
import { employeeFullName, formatDateHired } from '../../utils/employees';
import { formatLastActivity } from '../../utils/users';
import { AccountStatusBadge } from '../users/AccountStatusBadge';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { EmploymentStatusBadge } from './EmploymentStatusBadge';

interface EmployeeDetailsModalProps {
  view: EmployeeView | null;
  onClose: () => void;
  onEdit: (view: EmployeeView) => void;
}

function Section({ title, children }: {title: string;children: React.ReactNode;}) {
  return (
    <section className="border-t border-line pt-4">
      <h3 className="text-[13px] font-semibold text-ink">{title}</h3>
      <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">{children}</dl>
    </section>);

}

function Field({ label, children }: {label: string;children: React.ReactNode;}) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink">{children}</dd>
    </div>);

}

export function EmployeeDetailsModal({ view: openView, onClose, onEdit }: EmployeeDetailsModalProps) {
  const navigate = useNavigate();
  const lastView = useRef<EmployeeView | null>(openView);
  if (openView) lastView.current = openView;
  const view = openView ?? lastView.current;

  return (
    <Modal
      open={openView !== null}
      onClose={onClose}
      size="lg"
      title="Employee details"
      description="Workforce profile combined with the linked user account."
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          {openView && <Button onClick={() => onEdit(openView)}>Edit employee</Button>}
        </>
      }>
      
      {view &&
      <div className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar name={view.fullName} src={view.employee.avatar ?? undefined} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-ink">{employeeFullName(view.employee, true)}</p>
              <p className="truncate text-sm text-muted">
                {view.position?.name ?? '—'} · {view.department?.name ?? '—'}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone="primary" className="tabular-nums">
                  {view.employee.employeeNumber}
                </Badge>
                <EmploymentStatusBadge status={view.employee.employmentStatus} />
              </div>
            </div>
          </div>

          <Section title="Contact information">
            <Field label="Email">{view.user?.email ?? '—'}</Field>
            <Field label="Phone">{view.employee.phone || '—'}</Field>
            <Field label="Address">{view.employee.address || '—'}</Field>
          </Section>

          <Section title="Employment information">
            <Field label="Employee number">{view.employee.employeeNumber}</Field>
            <Field label="Department">{view.department?.name ?? '—'}</Field>
            <Field label="Position">{view.position?.name ?? '—'}</Field>
            <Field label="Date hired">{formatDateHired(view.employee.dateHired)}</Field>
            <Field label="Employment status">
              <EmploymentStatusBadge status={view.employee.employmentStatus} />
            </Field>
          </Section>

          <Section title="Account information">
            {view.user ?
          <>
                <Field label="User ID">{view.user.id}</Field>
                <Field label="Role">Employee</Field>
                <Field label="Account status">
                  <AccountStatusBadge status={view.user.status} />
                </Field>
                <Field label="Last activity">{formatLastActivity(view.user.lastActivity)}</Field>
                <div className="sm:col-span-2">
                  <button
                type="button"
                onClick={() => navigate('/users')}
                className="inline-flex items-center gap-1 rounded text-[13px] font-medium text-primary transition-colors duration-150 hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                
                    Manage account access in User Management
                    <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              </> :

          <Field label="User account">No linked account</Field>
          }
          </Section>
        </div>
      }
    </Modal>);

}