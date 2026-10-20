import React, { useCallback, useMemo, useState } from 'react';
import { Building2Icon, CloudOffIcon, PlusIcon, SearchXIcon } from 'lucide-react';
import { DepartmentDetailsModal } from '../components/departments/DepartmentDetailsModal';
import { DepartmentFormModal } from '../components/departments/DepartmentFormModal';
import { DepartmentSummary } from '../components/departments/DepartmentSummary';
import { DepartmentTable, type DepartmentRow } from '../components/departments/DepartmentTable';
import { DeactivateRecordDialog, type DeactivateRequest } from '../components/organization/DeactivateRecordDialog';
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
import type { Department, DepartmentInput, DepartmentSortKey, RecordStatusFilter } from '../types/organization';
import { departmentStats } from '../utils/organization';

interface DepartmentsProps {
  /** Prototype control: first load fails so the error state can be reviewed. */
  simulateLoadError?: boolean;
}

interface FormState {
  open: boolean;
  editing?: Department;
}

const statusOrder = { active: 0, inactive: 1 };

function compareDepartments(a: DepartmentRow, b: DepartmentRow, key: DepartmentSortKey) {
  switch (key) {
    case 'name':
      return a.department.name.localeCompare(b.department.name);
    case 'code':
      return a.department.code.localeCompare(b.department.code);
    case 'employees':
      return a.employees - b.employees;
    case 'positions':
      return a.positions - b.positions;
    case 'status':
      return statusOrder[a.department.status] - statusOrder[b.department.status];
  }
}

const searchText = (r: DepartmentRow) => `${r.department.name} ${r.department.code} ${r.department.description}`;

export function Departments({ simulateLoadError = false }: DepartmentsProps) {
  const { departments, positions, createDepartment, updateDepartment, setDepartmentStatus } = useOrganization();
  const { employees } = useEmployees();
  const { toast } = useToast();
  const { state: loadState, retry } = useSimulatedLoad(simulateLoadError);

  const [status, setStatus] = useState<RecordStatusFilter>('all');
  const [form, setForm] = useState<FormState>({ open: false });
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [deactivating, setDeactivating] = useState<DeactivateRequest | null>(null);

  const rows = useMemo<DepartmentRow[]>(
    () =>
    departments.map((department) => {
      const s = departmentStats(department, positions, employees);
      return { department, employees: s.employees, positions: s.positions };
    }),
    [departments, positions, employees]
  );

  const matches = useCallback((r: DepartmentRow) => status === 'all' || r.department.status === status, [status]);
  const directory = useTableDirectory<DepartmentRow, DepartmentSortKey>({
    rows,
    searchText,
    matches,
    compare: compareDepartments,
    initialSort: { key: 'name', direction: 'asc' },
    descFirst: ['employees', 'positions']
  });
  const hasFilters = directory.query.trim() !== '' || status !== 'all';
  const clearFilters = () => {
    directory.setQuery('');
    setStatus('all');
  };

  const viewing = departments.find((d) => d.id === viewingId) ?? null;

  const openEdit = (department: Department) => {
    setViewingId(null);
    setForm({ open: true, editing: department });
  };
  const closeForm = () => setForm((current) => ({ ...current, open: false }));

  const submitForm = (input: DepartmentInput) => {
    if (form.editing) {
      updateDepartment(form.editing.id, input);
      toast({ title: 'Department updated successfully.' });
    } else {
      const created = createDepartment(input);
      toast({ title: 'Department created successfully.', description: `${created.name} (${created.code}) was added.` });
    }
    closeForm();
  };

  const toggleStatus = (row: DepartmentRow) => {
    const d = row.department;
    if (d.status === 'inactive') {
      setDepartmentStatus(d.id, 'active');
      toast({ title: 'Department activated successfully.', description: `${d.name} is available for new assignments.` });
      return;
    }
    const linked = row.employees > 0 || row.positions > 0;
    setDeactivating({
      id: d.id,
      name: d.name,
      warning: linked ?
      `This department currently contains ${row.employees} ${row.employees === 1 ? 'employee' : 'employees'} and ${row.positions} ${row.positions === 1 ? 'position' : 'positions'}. Deactivating it may affect future employee assignments.` :
      undefined
    });
  };

  const confirmDeactivate = (request: DeactivateRequest) => {
    setDepartmentStatus(request.id, 'inactive');
    setDeactivating(null);
    toast({ tone: 'info', title: 'Department deactivated successfully.', description: `${request.name} is no longer available for new assignments.` });
  };

  const addButton =
  <Button leftIcon={<PlusIcon className="h-4 w-4" />} onClick={() => setForm({ open: true })}>
      Add Department
    </Button>;


  return (
    <div className="space-y-6">
      <PageHeader title="Department Management" description="Manage organizational departments and workforce structure." actions={addButton} />

      {loadState === 'ready' && <DepartmentSummary departments={departments} employees={employees} />}

      <Card bodyClassName="p-0">
        {loadState === 'error' ?
        <EmptyState
          icon={CloudOffIcon}
          title="Unable to load departments."
          description="Something went wrong while loading the organization structure. Please try again."
          action={<Button onClick={retry}>Try Again</Button>}
          className="py-16" /> :


        <>
            <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center">
              <SearchInput
              value={directory.query}
              onChange={directory.setQuery}
              label="Search departments"
              placeholder="Search by name, code or description"
              className="sm:max-w-sm" />
            
              <div className="flex items-center gap-3 sm:ml-auto">
                <Select
                hideLabel
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as RecordStatusFilter)}
                className="w-40"
                options={[
                { value: 'all', label: 'All statuses' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }]
                } />
              
                <p className="whitespace-nowrap text-[13px] text-muted" aria-live="polite">
                  {directory.visible.length} {directory.visible.length === 1 ? 'department' : 'departments'}
                </p>
                {hasFilters &&
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear
                  </Button>
              }
              </div>
            </div>

            {loadState === 'loading' ?
          <LoadingState variant="table" rows={6} columns={5} label="Loading departments…" /> :
          directory.visible.length === 0 ?
          <EmptyState
            icon={departments.length === 0 ? Building2Icon : SearchXIcon}
            title="No departments found."
            description={
            departments.length === 0 ?
            'Create a department to organize your workforce.' :
            'Try adjusting your search or create a new department.'
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


          <DepartmentTable
            rows={directory.visible}
            sort={directory.sort}
            onSort={directory.toggleSort}
            onView={(r) => setViewingId(r.department.id)}
            onEdit={(r) => openEdit(r.department)}
            onToggleStatus={toggleStatus} />

          }
          </>
        }
      </Card>

      <DepartmentFormModal open={form.open} editing={form.editing} departments={departments} onClose={closeForm} onSubmit={submitForm} />
      <DepartmentDetailsModal
        department={viewing}
        positions={positions}
        employees={employees}
        onClose={() => setViewingId(null)}
        onEdit={openEdit} />
      
      <DeactivateRecordDialog noun="department" request={deactivating} onClose={() => setDeactivating(null)} onConfirm={confirmDeactivate} />
    </div>);

}