import React, { useRef } from 'react';
import { LockIcon } from 'lucide-react';
import { useEmployees } from '../../contexts/EmployeesContext';
import type { SystemUser } from '../../types/users';
import { useOrganization } from '../../contexts/OrganizationContext';
import { findDepartment, findPosition } from '../../utils/organization';
import { displayName, formatCreatedDate, formatLastActivity, isSystemAdmin, PROTECTED_ACCOUNT_MESSAGE } from '../../utils/users';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { AccountStatusBadge } from './AccountStatusBadge';
import { RoleBadge } from './RoleBadge';

interface UserDetailsModalProps {
  user: SystemUser | null;
  onClose: () => void;
  onEdit: (user: SystemUser) => void;
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

export function UserDetailsModal({ user: openUser, onClose, onEdit }: UserDetailsModalProps) {
  // Keep showing the last user while the dialog animates out.
  const lastUser = useRef<SystemUser | null>(openUser);
  if (openUser) lastUser.current = openUser;
  const user = openUser ?? lastUser.current;
  const admin = user ? isSystemAdmin(user) : false;
  const { employees } = useEmployees();
  const { departments, positions } = useOrganization();
  const record = user ? employees.find((e) => e.userId === user.id) : undefined;

  return (
    <Modal
      open={openUser !== null}
      onClose={onClose}
      title="User details"
      description={user ? `User ID ${user.id}` : undefined}
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          {user && !admin && <Button onClick={() => onEdit(user)}>Edit employee</Button>}
        </>
      }>
      
      {user &&
      <div className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar name={displayName(user)} src={user.avatarUrl} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-ink">{displayName(user)}</p>
              <p className="truncate text-sm text-muted">{user.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <RoleBadge role={user.role} />
                <AccountStatusBadge status={user.status} />
              </div>
            </div>
          </div>

          {admin &&
        <div className="flex items-start gap-2.5 rounded-lg bg-primary-soft px-3 py-2.5 text-[13px] text-primary">
              <LockIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <p>
                <span className="font-medium">Protected System Administrator.</span>{' '}
                <span className="text-ink/80">{PROTECTED_ACCOUNT_MESSAGE}</span>
              </p>
            </div>
        }

          <Section title="Account information">
            <Field label="Full name">{displayName(user)}</Field>
            <Field label="Email">{user.email}</Field>
            <Field label="Role">{admin ? 'Admin' : 'Employee'}</Field>
            <Field label="Account status">{user.status === 'active' ? 'Active' : 'Inactive'}</Field>
          </Section>

          <Section title="Access information">
            <Field label="Account created">{formatCreatedDate(user.createdAt)}</Field>
            <Field label="Last activity">{formatLastActivity(user.lastActivity)}</Field>
          </Section>

          {admin ?
        <Section title="System access">
              <Field label="Role">Administrator</Field>
              <Field label="Access level">Full System Access</Field>
              <Field label="Account type">Protected System Administrator</Field>
              <Field label="Administrators in WorkSync">1 (sole system administrator)</Field>
            </Section> :

        record &&
        <Section title="Employee information">
                <Field label="Employee number">{record.employeeNumber}</Field>
                <Field label="Department">{findDepartment(departments, record.departmentId)?.name ?? '—'}</Field>
                <Field label="Position">{findPosition(positions, record.positionId)?.name ?? '—'}</Field>
              </Section>

        }
        </div>
      }
    </Modal>);

}