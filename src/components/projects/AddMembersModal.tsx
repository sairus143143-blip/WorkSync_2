import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckIcon, SearchXIcon } from 'lucide-react';
import type { Employee, EmploymentStatusFilter } from '../../types/employees';
import type { Department, Position } from '../../types/organization';
import { cn } from '../../utils/cn';
import { employeeFullName, employmentStatusLabels } from '../../utils/employees';
import { findDepartment, findPosition } from '../../utils/organization';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { Modal } from '../ui/Modal';
import { SearchInput } from '../ui/SearchInput';
import { Select } from '../ui/Select';

interface AddMembersModalProps {
  open: boolean;
  projectName: string;
  employees: Employee[];
  departments: Department[];
  positions: Position[];
  /** Employee IDs already on the project. */
  currentMemberIds: Set<string>;
  onClose: () => void;
  onSubmit: (employeeIds: string[]) => void;
}

/** Multi-select of employees. Only active, non-member employees can be selected. */
export function AddMembersModal({ open, projectName, employees, departments, positions, currentMemberIds, onClose, onSubmit }: AddMembersModalProps) {
  const [query, setQuery] = useState('');
  const [departmentId, setDepartmentId] = useState('all');
  const [positionId, setPositionId] = useState('all');
  const [status, setStatus] = useState<EmploymentStatusFilter>('active');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const lastName = useRef(projectName);
  if (open) lastName.current = projectName;

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setDepartmentId('all');
    setPositionId('all');
    setStatus('active');
    setSelected(new Set());
  }, [open]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return employees.
    filter(
      (e) =>
      (departmentId === 'all' || e.departmentId === departmentId) && (
      positionId === 'all' || e.positionId === positionId) && (
      status === 'all' || e.employmentStatus === status) && (
      !q || `${employeeFullName(e)} ${e.employeeNumber}`.toLowerCase().includes(q))
    ).
    sort((a, b) => employeeFullName(a).localeCompare(employeeFullName(b)));
  }, [employees, query, departmentId, positionId, status]);

  const reasonDisabled = (e: Employee): string | null => {
    if (currentMemberIds.has(e.id)) return 'Already a member';
    if (e.employmentStatus !== 'active') return employmentStatusLabels[e.employmentStatus];
    return null;
  };

  const toggle = (id: string) =>
  setSelected((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id);else
    next.add(id);
    return next;
  });

  const positionOptions = departmentId === 'all' ? positions : positions.filter((p) => p.departmentId === departmentId);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Add Members"
      description={`Select employees to add to ${lastName.current}. Only active employees can be assigned.`}
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={selected.size === 0} onClick={() => onSubmit([...selected])}>
            {selected.size === 0 ? 'Add Members' : `Add ${selected.size} ${selected.size === 1 ? 'member' : 'members'}`}
          </Button>
        </>
      }>
      
      <div className="space-y-3">
        <SearchInput value={query} onChange={setQuery} label="Search employees" placeholder="Search employees..." />
        <div className="grid gap-3 sm:grid-cols-3">
          <Select
            hideLabel
            label="Department"
            value={departmentId}
            onChange={(e) => {
              setDepartmentId(e.target.value);
              setPositionId('all');
            }}
            options={[{ value: 'all', label: 'All Departments' }, ...departments.map((d) => ({ value: d.id, label: d.name }))]} />
          
          <Select
            hideLabel
            label="Position"
            value={positionId}
            onChange={(e) => setPositionId(e.target.value)}
            options={[{ value: 'all', label: 'All Positions' }, ...positionOptions.map((p) => ({ value: p.id, label: p.name }))]} />
          
          <Select
            hideLabel
            label="Employment status"
            value={status}
            onChange={(e) => setStatus(e.target.value as EmploymentStatusFilter)}
            options={[
            { value: 'all', label: 'All statuses' },
            { value: 'active', label: 'Active' },
            { value: 'on_leave', label: 'On Leave' },
            { value: 'inactive', label: 'Inactive' }]
            } />
          
        </div>

        {visible.length === 0 ?
        <EmptyState icon={SearchXIcon} title="No employees found." description="Try adjusting your search or filters." className="py-8" /> :

        <ul className="max-h-80 divide-y divide-line overflow-y-auto rounded-lg border border-line" aria-label="Employees">
            {visible.map((e) => {
            const reason = reasonDisabled(e);
            const checked = selected.has(e.id);
            const name = employeeFullName(e);
            return (
              <li key={e.id}>
                  <label
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5',
                    reason ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-ink/[0.03]',
                    checked && 'bg-primary-soft/60'
                  )}>
                  
                    <input type="checkbox" className="sr-only" checked={checked} disabled={Boolean(reason)} onChange={() => toggle(e.id)} />
                    <span
                    aria-hidden
                    className={cn(
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors duration-150',
                      checked ? 'border-primary bg-primary text-primary-fg' : 'border-line bg-surface'
                    )}>
                    
                      {checked && <CheckIcon className="h-3 w-3" />}
                    </span>
                    <Avatar name={name} src={e.avatar ?? undefined} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{name}</span>
                      <span className="block truncate text-[13px] text-muted">
                        {e.employeeNumber} · {findPosition(positions, e.positionId)?.name ?? '—'} · {findDepartment(departments, e.departmentId)?.name ?? '—'}
                      </span>
                    </span>
                    {reason && <span className="shrink-0 text-xs text-muted">{reason}</span>}
                  </label>
                </li>);

          })}
          </ul>
        }
        <p className="text-[13px] text-muted" aria-live="polite">
          {selected.size} selected
        </p>
      </div>
    </Modal>);

}