import React, { useMemo, useState } from 'react';
import { CloudOffIcon, PlusIcon, SearchXIcon } from 'lucide-react';
import { EmployeeDetailsModal } from '../components/employees/EmployeeDetailsModal';
import { EmployeeFilters } from '../components/employees/EmployeeFilters';
import { EmployeeProfileFormModal } from '../components/employees/EmployeeProfileFormModal';
import { EmployeeSummary } from '../components/employees/EmployeeSummary';
import { EmployeeTable } from '../components/employees/EmployeeTable';
import { EmploymentStatusDialog, type StatusChangeRequest } from '../components/employees/EmploymentStatusDialog';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { PageHeader } from '../components/ui/PageHeader';
import { useEmployees } from '../contexts/EmployeesContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { useToast } from '../contexts/ToastContext';
import { useUsers } from '../contexts/UsersContext';
import { useEmployeeDirectory } from '../hooks/useEmployeeDirectory';
import { useSimulatedLoad } from '../hooks/useSimulatedLoad';
import type { EmployeeFormValues, EmployeeView, EmploymentStatus } from '../types/employees';
import { buildEmployeeViews, employmentStatusLabels, nextEmployeeNumber } from '../utils/employees';

interface EmployeesProps {
  /** Prototype control: makes the first load fail so the error state can be reviewed. */
  simulateLoadError?: boolean;
}

interface FormState {
  open: boolean;
  editing?: EmployeeView;
}

export function Employees({ simulateLoadError = false }: EmployeesProps) {
  const { employees, createEmployee, updateEmployee, setEmploymentStatus } = useEmployees();
  const { users } = useUsers();
  const { toast } = useToast();

  const { positions } = useOrganization();

  const views = useMemo(
    () => buildEmployeeViews(employees, users, positions),
    [employees, users, positions]
  );
  const directory = useEmployeeDirectory(views);
  const { state: loadState, retry } = useSimulatedLoad(simulateLoadError);
  const [form, setForm] = useState<FormState>({ open: false });
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [statusRequest, setStatusRequest] = useState<StatusChangeRequest | null>(null);

  const viewing = views.find((v) => v.employee.id === viewingId) ?? null;

  const openAdd = () => setForm({ open: true });
  const openEdit = (view: EmployeeView) => {
    setViewingId(null);
    setForm({ open: true, editing: view });
  };
  const closeForm = () => setForm((current) => ({ ...current, open: false }));

  const submitForm = (values: EmployeeFormValues) => {
    if (form.editing) {
      updateEmployee(form.editing.employee.id, values);
      toast({ title: 'Employee information updated successfully.' });
    } else {
      const created = createEmployee(values);
      toast({
        title: 'Employee created successfully.',
        description: `${created.firstName} ${created.lastName} (${created.employeeNumber}) now has an Employee account.`
      });
    }
    closeForm();
  };

  const applyStatus = (view: EmployeeView, next: EmploymentStatus) => {
    const wasInactive = view.employee.employmentStatus === 'inactive';
    setEmploymentStatus(view.employee.id, next);
    if (wasInactive && next === 'active') {
      toast({ title: 'Employee account activated.', description: `${view.fullName} is Active again and can sign in.` });
    } else {
      toast({ title: 'Employee status updated successfully.', description: `${view.fullName} is now ${employmentStatusLabels[next]}.` });
    }
  };

  const requestStatus = (view: EmployeeView, next: EmploymentStatus) => {
    if (next === 'active') applyStatus(view, next);else
    setStatusRequest({ view, next });
  };

  const confirmStatus = (request: StatusChangeRequest) => {
    applyStatus(request.view, request.next);
    setStatusRequest(null);
  };

  const addButton =
  <Button leftIcon={<PlusIcon className="h-4 w-4" />} onClick={openAdd}>
      Add Employee
    </Button>;


  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Management"
        description="Manage employee profiles, workforce information, and employment records."
        actions={addButton} />
      

      {loadState === 'ready' && <EmployeeSummary employees={employees} />}

      <Card bodyClassName="p-0">
        {loadState === 'error' ?
        <EmptyState
          icon={CloudOffIcon}
          title="Unable to load employee records."
          description="Something went wrong while loading the workforce list. Please try again."
          action={<Button onClick={retry}>Try Again</Button>}
          className="py-16" /> :


        <>
            <EmployeeFilters
            query={directory.query}
            onQueryChange={directory.setQuery}
            status={directory.status}
            onStatusChange={directory.setStatus}
            positionId={directory.positionId}
            onPositionChange={directory.setPositionId}
            hasFilters={directory.hasFilters}
            onClear={directory.clearFilters}
            resultCount={directory.visible.length} />
          
            {loadState === 'loading' ?
          <LoadingState variant="table" rows={6} columns={5} label="Loading employees…" /> :
          directory.visible.length === 0 ?
          <EmptyState
            icon={SearchXIcon}
            title="No employees found."
            description={directory.hasFilters ? 'Try adjusting your search or filters.' : 'Try adjusting your filters or add a new employee.'}
            action={
            <div className="flex flex-wrap justify-center gap-2">
                    {directory.hasFilters &&
              <Button variant="secondary" onClick={directory.clearFilters}>
                        Clear filters
                      </Button>
              }
                    {addButton}
                  </div>
            } /> :


          <EmployeeTable
            rows={directory.visible}
            sort={directory.sort}
            onSort={directory.toggleSort}
            onView={(v) => setViewingId(v.employee.id)}
            onEdit={openEdit}
            onChangeStatus={requestStatus} />

          }
          </>
        }
      </Card>

      <EmployeeProfileFormModal
        open={form.open}
        editing={form.editing}
        employees={employees}
        users={users}
        positions={positions}
        suggestedNumber={nextEmployeeNumber(employees)}
        onClose={closeForm}
        onSubmit={submitForm} />
      
      <EmployeeDetailsModal view={viewing} onClose={() => setViewingId(null)} onEdit={openEdit} />
      <EmploymentStatusDialog request={statusRequest} onClose={() => setStatusRequest(null)} onConfirm={confirmStatus} />
    </div>);

}