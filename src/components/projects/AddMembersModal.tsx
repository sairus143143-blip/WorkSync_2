import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckIcon, SearchXIcon } from 'lucide-react';
import type { Employee, EmploymentStatusFilter } from '../../types/employees';
import type { Position } from '../../types/organization';
import { cn } from '../../utils/cn';
import { employeeFullName, employmentStatusLabels } from '../../utils/employees';
import { findPosition } from '../../utils/organization';
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
  positions: Position[];
  /** Employee IDs already on the project. */
  currentMemberIds: Set<string>;
  onClose: () => void;
  onSubmit: (employeeIds: string[]) => void;
}

/** Multi-select of employees. Only active, non-member employees can be selected. */
export function AddMembersModal({ open, projectName, employees, positions, currentMemberIds, onClose, onSubmit }: AddMembersModalProps) {
  const [query, setQuery] = useState('');
  const [positionId, setPositionId] = useState('all');
  const [status, setStatus] = useState<EmploymentStatusFilter>('active');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const lastName = useRef(projectName);
  if (open) lastName.current = projectName;

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setPositionId('all');
    setStatus('active');
    setSelected(new Set());
  }, [open]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return employees
      .filter((employee) =>
        (positionId === 'all' || employee.positionId === positionId) &&
        (status === 'all' || employee.employmentStatus === status) &&
        (!q || `${employeeFullName(employee)} ${employee.employeeNumber}`.toLowerCase().includes(q))
      )
      .sort((a, b) => employeeFullName(a).localeCompare(employeeFullName(b)));
  }, [employees, query, positionId, status]);

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
        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            hideLabel
            label="Position"
            value={positionId}
            onChange={(e) => setPositionId(e.target.value)}
            options={[{ value: 'all', label: 'All Positions' }, ...positions.map((p) => ({ value: p.id, label: p.name }))]} />
          
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
                        {e.employeeNumber} · {findPosition(positions, e.positionId)?.name ?? 'No position'}
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