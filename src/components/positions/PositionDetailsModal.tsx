import React, { useRef } from 'react';
import { Building2Icon } from 'lucide-react';
import type { Employee } from '../../types/employees';
import type { Department, Position } from '../../types/organization';
import { employeeFullName } from '../../utils/employees';
import { findDepartment, positionStats } from '../../utils/organization';
import { EmploymentStatusBadge } from '../employees/EmploymentStatusBadge';
import { RecordStatusBadge } from '../organization/RecordStatusBadge';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface PositionDetailsModalProps {
  position: Position | null;
  departments: Department[];
  employees: Employee[];
  onClose: () => void;
  onEdit: (position: Position) => void;
}

function Stat({ label, value }: {label: string;value: number;}) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 text-xl font-semibold tabular-nums text-ink">{value}</dd>
    </div>);

}

export function PositionDetailsModal({ position: open, departments, employees, onClose, onEdit }: PositionDetailsModalProps) {
  const last = useRef<Position | null>(open);
  if (open) last.current = open;
  const position = open ?? last.current;

  const department = position ? findDepartment(departments, position.departmentId) : undefined;
  const stats = position ? positionStats(position, employees) : null;
  const people = position ? employees.filter((e) => e.positionId === position.id) : [];

  return (
    <Modal
      open={open !== null}
      onClose={onClose}
      size="lg"
      title="Position details"
      description={position ? `Position ID ${position.id}` : undefined}
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          {open && <Button onClick={() => onEdit(open)}>Edit position</Button>}
        </>
      }>
      
      {position && stats &&
      <div className="space-y-5">
          <div>
            <p className="flex items-center gap-1.5 text-[13px] text-muted">
              <Building2Icon className="h-3.5 w-3.5" aria-hidden />
              {department?.name ?? 'Unknown department'}
              {department?.status === 'inactive' && <Badge className="ml-1">Inactive department</Badge>}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-ink">{position.name}</h3>
              <Badge tone="primary" className="tabular-nums">
                {position.code}
              </Badge>
              <RecordStatusBadge status={position.status} />
            </div>
            <p className="mt-1 text-sm text-muted">{position.description}</p>
          </div>

          <dl className="grid grid-cols-3 gap-4 border-t border-line pt-4">
            <Stat label="Total employees" value={stats.employees} />
            <Stat label="Active employees" value={stats.activeEmployees} />
            <Stat label="Inactive employees" value={stats.inactiveEmployees} />
          </dl>

          <section className="border-t border-line pt-4">
            <h3 className="text-[13px] font-semibold text-ink">Employees in this position</h3>
            {people.length === 0 ?
          <p className="mt-2 text-[13px] text-muted">No employees are assigned to this position yet.</p> :

          <ul className="mt-2 divide-y divide-line">
                {people.map((e) => {
              const name = employeeFullName(e);
              return (
                <li key={e.id} className="flex items-center gap-3 py-2.5">
                      <Avatar name={name} src={e.avatar ?? undefined} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{name}</p>
                        <p className="text-xs tabular-nums text-muted">{e.employeeNumber}</p>
                      </div>
                      <EmploymentStatusBadge status={e.employmentStatus} />
                    </li>);

            })}
              </ul>
          }
          </section>
        </div>
      }
    </Modal>);

}