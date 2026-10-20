import React, { useRef } from 'react';
import { BriefcaseIcon } from 'lucide-react';
import type { Employee } from '../../types/employees';
import type { Department, Position } from '../../types/organization';
import { employeeFullName } from '../../utils/employees';
import { departmentStats, positionsInDepartment } from '../../utils/organization';
import { RecordStatusBadge } from '../organization/RecordStatusBadge';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface DepartmentDetailsModalProps {
  department: Department | null;
  positions: Position[];
  employees: Employee[];
  onClose: () => void;
  onEdit: (department: Department) => void;
}

function Stat({ label, value }: {label: string;value: number;}) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 text-xl font-semibold tabular-nums text-ink">{value}</dd>
    </div>);

}

export function DepartmentDetailsModal({ department: open, positions, employees, onClose, onEdit }: DepartmentDetailsModalProps) {
  const last = useRef<Department | null>(open);
  if (open) last.current = open;
  const department = open ?? last.current;

  const stats = department ? departmentStats(department, positions, employees) : null;
  const deptPositions = department ? positionsInDepartment(positions, department.id) : [];

  return (
    <Modal
      open={open !== null}
      onClose={onClose}
      size="lg"
      title="Department details"
      description={department ? `Department ID ${department.id}` : undefined}
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          {open && <Button onClick={() => onEdit(open)}>Edit department</Button>}
        </>
      }>
      
      {department && stats &&
      <div className="space-y-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-ink">{department.name}</h3>
              <Badge tone="primary">{department.code}</Badge>
              <RecordStatusBadge status={department.status} />
            </div>
            <p className="mt-1 text-sm text-muted">{department.description}</p>
          </div>

          <dl className="grid grid-cols-2 gap-4 border-t border-line pt-4 sm:grid-cols-4">
            <Stat label="Total employees" value={stats.employees} />
            <Stat label="Active employees" value={stats.activeEmployees} />
            <Stat label="Inactive employees" value={stats.inactiveEmployees} />
            <Stat label="Total positions" value={stats.positions} />
          </dl>

          <section className="border-t border-line pt-4">
            <h3 className="text-[13px] font-semibold text-ink">Positions in this department</h3>
            {deptPositions.length === 0 ?
          <p className="mt-2 text-[13px] text-muted">No positions yet. Add one from Position Management.</p> :

          <ul className="mt-3 space-y-3">
                {deptPositions.map((position) => {
              const people = employees.filter((e) => e.positionId === position.id);
              return (
                <li key={position.id} className="rounded-lg border border-line">
                      <div className="flex flex-wrap items-center gap-2 px-3 py-2.5">
                        <BriefcaseIcon className="h-4 w-4 shrink-0 text-subtle" aria-hidden />
                        <span className="text-sm font-medium text-ink">{position.name}</span>
                        <span className="text-xs tabular-nums text-muted">{position.code}</span>
                        {position.status === 'inactive' && <Badge>Inactive</Badge>}
                        <span className="ml-auto text-xs tabular-nums text-muted">
                          {people.length} {people.length === 1 ? 'employee' : 'employees'}
                        </span>
                      </div>
                      {people.length > 0 &&
                  <ul className="border-t border-line py-1.5 pl-9 pr-3">
                          {people.map((e) =>
                    <li key={e.id} className="flex items-center justify-between gap-3 py-1 text-[13px]">
                              <span className={e.employmentStatus === 'inactive' ? 'text-subtle' : 'text-ink'}>{employeeFullName(e)}</span>
                              <span className="tabular-nums text-muted">{e.employeeNumber}</span>
                            </li>
                    )}
                        </ul>
                  }
                    </li>);

            })}
              </ul>
          }
          </section>
        </div>
      }
    </Modal>);

}