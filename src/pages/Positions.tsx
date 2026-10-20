import React, { useCallback, useMemo, useState } from 'react';
import { BriefcaseIcon, CloudOffIcon, PlusIcon, SearchXIcon } from 'lucide-react';
import { DeactivateRecordDialog, type DeactivateRequest } from '../components/organization/DeactivateRecordDialog';
import { PositionDetailsModal } from '../components/positions/PositionDetailsModal';
import { PositionFormModal } from '../components/positions/PositionFormModal';
import { PositionSummary } from '../components/positions/PositionSummary';
import { PositionTable, type PositionRow } from '../components/positions/PositionTable';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchInput } from '../components/ui/SearchInput';
import { Select } from '../components/ui/Select';
import { useEmployees } from '../contexts/EmployeesContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { useToast } from '../contexts/ToastContext';
import { useSimulatedLoad } from '../hooks/useSimulatedLoad';
import { useTableDirectory } from '../hooks/useTableDirectory';
import type { Position, PositionInput, PositionSortKey, RecordStatusFilter } from '../types/organization';
import { findDepartment, positionStats } from '../utils/organization';

interface PositionsProps {
  /** Prototype control: first load fails so the error state can be reviewed. */
  simulateLoadError?: boolean;
}

interface FormState {
  open: boolean;
  editing?: Position;
}

const statusOrder = { active: 0, inactive: 1 };

function comparePositions(a: PositionRow, b: PositionRow, key: PositionSortKey) {
  switch (key) {
    case 'name':
      return a.position.name.localeCompare(b.position.name);
    case 'code':
      return a.position.code.localeCompare(b.position.code);
    case 'department':
      return (a.department?.name ?? '').localeCompare(b.department?.name ?? '') || a.position.code.localeCompare(b.position.code);
    case 'employees':
      return a.employees - b.employees;
    case 'status':
      return statusOrder[a.position.status] - statusOrder[b.position.status];
  }
}

const searchText = (r: PositionRow) => `${r.position.name} ${r.position.code} ${r.department?.name ?? ''}`;

export function Positions({ simulateLoadError = false }: PositionsProps) {
  const { departments, positions, createPosition, updatePosition, setPositionStatus } = useOrganization();
  const { employees } = useEmployees();
  const { toast } = useToast();
  const { state: loadState, retry } = useSimulatedLoad(simulateLoadError);

  const [departmentId, setDepartmentId] = useState('all');
  const [status, setStatus] = useState<RecordStatusFilter>('all');
  const [form, setForm] = useState<FormState>({ open: false });
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [deactivating, setDeactivating] = useState<DeactivateRequest | null>(null);

  const rows = useMemo<PositionRow[]>(
    () =>
    positions.map((position) => ({
      position,
      department: findDepartment(departments, position.departmentId),
      employees: positionStats(position, employees).employees
    })),
    [positions, departments, employees]
  );

  const matches = useCallback(
    (r: PositionRow) =>
    (departmentId === 'all' || r.position.departmentId === departmentId) && (status === 'all' || r.position.status === status),
    [departmentId, status]
  );
  const directory = useTableDirectory<PositionRow, PositionSortKey>({
    rows,
    searchText,
    matches,
    compare: comparePositions,
    initialSort: { key: 'department', direction: 'asc' },
    descFirst: ['employees']
  });
  const hasFilters = directory.query.trim() !== '' || departmentId !== 'all' || status !== 'all';
  const clearFilters = () => {
    directory.setQuery('');
    setDepartmentId('all');
    setStatus('all');
  };

  const viewing = positions.find((p) => p.id === viewingId) ?? null;
  const editingCount = form.editing ? rows.find((r) => r.position.id === form.editing?.id)?.employees ?? 0 : 0;

  const openEdit = (position: Position) => {
    setViewingId(null);
    setForm({ open: true, editing: position });
  };
  const closeForm = () => setForm((current) => ({ ...current, open: false }));

  const submitForm = (input: PositionInput) => {
    if (form.editing) {
      updatePosition(form.editing.id, input);
      toast({ title: 'Position updated successfully.' });
    } else {
      const created = createPosition(input);
      const dept = findDepartment(departments, created.departmentId);
      toast({ title: 'Position created successfully.', description: `${created.name} was added to ${dept?.name ?? 'the department'}.` });
    }
    closeForm();
  };

  const toggleStatus = (row: PositionRow) => {
    const p = row.position;
    if (p.status === 'inactive') {
      setPositionStatus(p.id, 'active');
      toast({ title: 'Position activated successfully.', description: `${p.name} can be used for new assignments.` });
      return;
    }
    setDeactivating({
      id: p.id,
      name: p.name,
      warning:
      row.employees > 0 ?
      `This position currently has ${row.employees} ${row.employees === 1 ? 'employee' : 'employees'} assigned. Deactivating it will prevent it from being used for new employee assignments.` :
      undefined
    });
  };

  const confirmDeactivate = (request: DeactivateRequest) => {
    setPositionStatus(request.id, 'inactive');
    setDeactivating(null);
    toast({ tone: 'info', title: 'Position deactivated successfully.', description: `${request.name} is no longer available for new assignments.` });
  };

  const addButton =
  <Button leftIcon={<PlusIcon className="h-4 w-4" />} onClick={() => setForm({ open: true })}>
      Add Position
    </Button>;


  return (
    <div className="space-y-6">
      <PageHeader title="Position Management" description="Manage employee positions and their department assignments." actions={addButton} />

      {loadState === 'ready' && <PositionSummary positions={positions} employees={employees} />}

      <Card bodyClassName="p-0">
        {loadState === 'error' ?
        <EmptyState
          icon={CloudOffIcon}
          title="Unable to load positions."
          description="Something went wrong while loading positions. Please try again."
          action={<Button onClick={retry}>Try Again</Button>}
          className="py-16" /> :


        <>
            <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center">
              <SearchInput
              value={directory.query}
              onChange={directory.setQuery}
              label="Search positions"
              placeholder="Search by position, code or department"
              className="lg:max-w-sm" />
            
              <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center lg:ml-auto">
                <Select
                hideLabel
                label="Department"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="sm:w-52"
                options={[{ value: 'all', label: 'All Departments' }, ...departments.map((d) => ({ value: d.id, label: d.name }))]} />
              
                <Select
                hideLabel
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as RecordStatusFilter)}
                className="sm:w-40"
                options={[
                { value: 'all', label: 'All statuses' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }]
                } />
              
                <p className="col-span-2 whitespace-nowrap text-[13px] text-muted sm:col-span-1" aria-live="polite">
                  {directory.visible.length} {directory.visible.length === 1 ? 'position' : 'positions'}
                </p>
                {hasFilters &&
              <Button variant="ghost" size="sm" onClick={clearFilters} className="col-span-2 justify-self-start sm:col-span-1">
                    Clear
                  </Button>
              }
              </div>
            </div>

            {loadState === 'loading' ?
          <LoadingState variant="table" rows={6} columns={5} label="Loading positions…" /> :
          directory.visible.length === 0 ?
          <EmptyState
            icon={positions.length === 0 ? BriefcaseIcon : SearchXIcon}
            title="No positions found."
            description={
            positions.length === 0 ? 'Create a position and assign it to a department.' : 'Try adjusting your search or filters.'
            }
            action={
            <div className="flex flex-wrap justify-center gap-2">
                    {hasFilters &&
              <Button variant="secondary" onClick={clearFilters}>
                        Clear filters
                      </Button>
              }
                    {addButton}
                  </div>
            } /> :


          <PositionTable
            rows={directory.visible}
            sort={directory.sort}
            onSort={directory.toggleSort}
            onView={(r) => setViewingId(r.position.id)}
            onEdit={(r) => openEdit(r.position)}
            onToggleStatus={toggleStatus} />

          }
          </>
        }
      </Card>

      <PositionFormModal
        open={form.open}
        editing={form.editing}
        positions={positions}
        departments={departments}
        defaultDepartmentId={departmentId === 'all' ? undefined : departmentId}
        assignedEmployees={editingCount}
        onClose={closeForm}
        onSubmit={submitForm} />
      
      <PositionDetailsModal
        position={viewing}
        departments={departments}
        employees={employees}
        onClose={() => setViewingId(null)}
        onEdit={openEdit} />
      
      <DeactivateRecordDialog noun="position" request={deactivating} onClose={() => setDeactivating(null)} onConfirm={confirmDeactivate} />
    </div>);

}