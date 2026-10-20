import React, { useRef } from 'react';
import { ChevronRightIcon } from 'lucide-react';
import type { AssignmentRow } from '../../types/assignments';
import type { Employee } from '../../types/employees';
import { SYSTEM_ADMIN_EMAIL } from '../../utils/users';
import { employeeFullName } from '../../utils/employees';
import { formatUpdatedDate, formatUpdatedTime } from '../../utils/assignments';
import { RecordStatusBadge } from '../organization/RecordStatusBadge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { AssignmentStatusBadge } from './AssignmentStatusBadge';

interface AssignmentDetailsModalProps {
  row: AssignmentRow | null;
  employees: Employee[];
  onClose: () => void;
  onAssign: (row: AssignmentRow) => void;
}

function Field({ label, children }: {label: string;children: React.ReactNode;}) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink">{children}</dd>
    </div>);

}

function Section({ title, children }: {title: string;children: React.ReactNode;}) {
  return (
    <section className="border-t border-line pt-4">
      <h3 className="text-[13px] font-semibold text-ink">{title}</h3>
      <dl className="mt-3 grid gap-4 sm:grid-cols-2">{children}</dl>
    </section>);

}

export function AssignmentDetailsModal({ row: open, employees, onClose, onAssign }: AssignmentDetailsModalProps) {
  const last = useRef<AssignmentRow | null>(open);
  if (open) last.current = open;
  const row = open ?? last.current;
  const people = row ? employees.filter((e) => e.positionId === row.position.id && e.employmentStatus !== 'inactive') : [];

  const flow = row ?
  [row.department?.name ?? 'Unknown department', row.position.name, row.adminArea ? `${row.adminArea.name} responsibility` : 'No responsibility defined'] :
  [];

  return (
    <Modal
      open={open !== null}
      onClose={onClose}
      size="lg"
      title="Assignment details"
      description={row?.assignment ? `Assignment ID ${row.assignment.id}` : 'This position has no assignment yet.'}
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          {open && open.status !== 'inactive' &&
        <Button onClick={() => onAssign(open)}>{open.status === 'unassigned' ? 'Assign Responsibility' : 'Edit Assignment'}</Button>
        }
        </>
      }>
      
      {row &&
      <div className="space-y-4">
          <ol aria-label="Organizational flow" className="flex flex-wrap items-center gap-1.5 text-[13px]">
            {flow.map((step, i) =>
          <li key={step} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRightIcon className="h-3.5 w-3.5 text-subtle" aria-hidden />}
                <span className={i === flow.length - 1 ? 'font-medium text-primary' : 'text-ink'}>{step}</span>
              </li>
          )}
          </ol>

          <Section title="Position information">
            <Field label="Position name">{row.position.name}</Field>
            <Field label="Position code">
              <span className="tabular-nums">{row.position.code}</span>
            </Field>
            <Field label="Department">{row.department?.name ?? 'Unknown department'}</Field>
            <Field label="Position status">
              <RecordStatusBadge status={row.position.status} />
            </Field>
          </Section>

          <Section title="Administrative responsibility">
            <Field label="Administrative area">{row.adminArea?.name ?? 'Not defined'}</Field>
            <Field label="Assignment status">
              <AssignmentStatusBadge status={row.status} />
            </Field>
            {row.departmentMismatch &&
          <p className="text-[13px] text-warning sm:col-span-2">
                This position moved to another department after it was assigned. Save the assignment again to confirm it.
              </p>
          }
          </Section>

          <Section title="System control">
            <Field label="Controlled by">System Administrator</Field>
            <Field label="Admin account">{SYSTEM_ADMIN_EMAIL}</Field>
          </Section>

          <Section title="Last updated">
            <Field label="Date">{row.assignment ? formatUpdatedDate(row.assignment.updatedAt) : '—'}</Field>
            <Field label="Time">{row.assignment ? formatUpdatedTime(row.assignment.updatedAt) : '—'}</Field>
          </Section>

          <section className="border-t border-line pt-4">
            <h3 className="text-[13px] font-semibold text-ink">Workforce context</h3>
            <p className="mt-1 text-[13px] text-muted">
              {people.length === 0 ?
            'No current employees hold this position.' :
            `${people.length} ${people.length === 1 ? 'employee works' : 'employees work'} under this responsibility through their position.`}
            </p>
            {people.length > 0 &&
          <ul className="mt-2 flex flex-wrap gap-1.5">
                {people.map((e) =>
            <li key={e.id} className="rounded-md bg-ink/[0.04] px-2 py-1 text-[13px] text-ink">
                    {employeeFullName(e)} <span className="tabular-nums text-muted">· {e.employeeNumber}</span>
                  </li>
            )}
              </ul>
          }
          </section>
        </div>
      }
    </Modal>);

}