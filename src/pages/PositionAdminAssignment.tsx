import React, { useCallback, useMemo, useState } from 'react';
import { CloudOffIcon, RefreshCwIcon, SearchXIcon, ShieldCheckIcon } from 'lucide-react';
import { AssignmentDetailsModal } from '../components/assignments/AssignmentDetailsModal';
import { AssignmentFormModal } from '../components/assignments/AssignmentFormModal';
import { AssignmentSummary } from '../components/assignments/AssignmentSummary';
import { AssignmentTable } from '../components/assignments/AssignmentTable';
import { DeactivateRecordDialog, type DeactivateRequest } from '../components/organization/DeactivateRecordDialog';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchInput } from '../components/ui/SearchInput';
import { Select } from '../components/ui/Select';
import { useAssignments } from '../contexts/AssignmentsContext';
import { useEmployees } from '../contexts/EmployeesContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { useToast } from '../contexts/ToastContext';
import { useSimulatedLoad } from '../hooks/useSimulatedLoad';
import { useTableDirectory } from '../hooks/useTableDirectory';
import type { AssignmentInput, AssignmentRow, AssignmentSortKey, AssignmentStatusFilter } from '../types/assignments';
import { buildAssignmentRows, summarizeAssignments } from '../utils/assignments';

interface PositionAdminAssignmentProps {
  /** Prototype control: first load fails so the error state can be reviewed. */
  simulateLoadError?: boolean;
}

const statusOrder = { assigned: 0, unassigned: 1, inactive: 2 };

function compareRows(a: AssignmentRow, b: AssignmentRow, key: AssignmentSortKey) {
  switch (key) {
    case 'name':
      return a.position.name.localeCompare(b.position.name);
    case 'code':
      return a.position.code.localeCompare(b.position.code);
    case 'department':
      return (a.department?.name ?? '').localeCompare(b.department?.name ?? '') || a.position.code.localeCompare(b.position.code);
    case 'area':
      // Unassigned rows sort last when ascending.
      return (a.adminArea?.name ?? '\uffff').localeCompare(b.adminArea?.name ?? '\uffff');
    case 'status':
      return statusOrder[a.status] - statusOrder[b.status];
    case 'updated':
      return (a.assignment?.updatedAt ?? '').localeCompare(b.assignment?.updatedAt ?? '');
  }
}

const searchText = (r: AssignmentRow) => `${r.position.name} ${r.position.code} ${r.department?.name ?? ''} ${r.adminArea?.name ?? ''}`;

export function PositionAdminAssignment({ simulateLoadError = false }: PositionAdminAssignmentProps) {
  const { departments, positions } = useOrganization();
  const { adminAreas, assignments, saveAssignment, setAssignmentStatus } = useAssignments();
  const { employees } = useEmployees();
  const { toast } = useToast();
  const { state: loadState, retry } = useSimulatedLoad(simulateLoadError);

  const [departmentId, setDepartmentId] = useState('all');
  const [status, setStatus] = useState<AssignmentStatusFilter>('all');
  const [formPositionId, setFormPositionId] = useState<string | null>(null);
  const [viewingPositionId, setViewingPositionId] = useState<string | null>(null);
  const [deactivating, setDeactivating] = useState<DeactivateRequest | null>(null);

  const rows = useMemo(
    () => buildAssignmentRows(positions, departments, adminAreas, assignments),
    [positions, departments, adminAreas, assignments]
  );
  const summary = summarizeAssignments(positions, assignments);

  const matches = useCallback(
    (r: AssignmentRow) => (departmentId === 'all' || r.position.departmentId === departmentId) && (status === 'all' || r.status === status),
    [departmentId, status]
  );
  const directory = useTableDirectory<AssignmentRow, AssignmentSortKey>({
    rows,
    searchText,
    matches,
    compare: compareRows,
    initialSort: { key: 'department', direction: 'asc' },
    descFirst: ['updated']
  });
  const hasFilters = directory.query.trim() !== '' || departmentId !== 'all' || status !== 'all';
  const clearFilters = () => {
    directory.setQuery('');
    setDepartmentId('all');
    setStatus('all');
  };
  const reviewUnassigned = () => {
    directory.setQuery('');
    setDepartmentId('all');
    setStatus('unassigned');
  };

  const formRow = rows.find((r) => r.position.id === formPositionId) ?? null;
  const viewingRow = rows.find((r) => r.position.id === viewingPositionId) ?? null;

  const openForm = (row: AssignmentRow) => {
    setViewingPositionId(null);
    setFormPositionId(row.position.id);
  };

  const submitForm = (input: AssignmentInput) => {
    const { created } = saveAssignment(input);
    toast({ title: created ? 'Position responsibility assigned successfully.' : 'Position responsibility updated successfully.' });
    setFormPositionId(null);
  };

  const activate = (row: AssignmentRow) => {
    if (!row.assignment) return;
    if (row.position.status === 'inactive' || row.department?.status === 'inactive') {
      toast({
        tone: 'error',
        title: 'Responsibility can’t be activated yet.',
        description: `Reactivate ${row.position.status === 'inactive' ? 'the position' : 'its department'} first.`
      });
      return;
    }
    setAssignmentStatus(row.assignment.id, 'assigned');
    toast({ title: 'Position responsibility activated.', description: `${row.position.name} → ${row.adminArea?.name ?? 'area'}` });
  };

  const confirmDeactivate = (request: DeactivateRequest) => {
    setAssignmentStatus(request.id, 'inactive');
    setDeactivating(null);
    toast({ tone: 'info', title: 'Position responsibility deactivated.' });
  };

  const showUnassignedHint = loadState === 'ready' && summary.unassignedPositions > 0 && status !== 'unassigned';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Position Admin Assignment"
        description="Define the administrative responsibility associated with each employee position."
        actions={
        <Button variant="secondary" leftIcon={<RefreshCwIcon className="h-4 w-4" />} onClick={retry} disabled={loadState === 'loading'}>
            Refresh
          </Button>
        } />
      

      <Alert tone="info" title="One system administrator, many areas of responsibility">
        WorkSync uses one system administrator account. Position assignments define which administrative area is responsible for each
        position. These assignments do not create additional administrator accounts.
      </Alert>

      {loadState === 'ready' && <AssignmentSummary positions={positions} assignments={assignments} />}

      {showUnassignedHint &&
      <div className="flex flex-col gap-3 rounded-xl border border-warning/20 bg-warning/[0.06] px-4 py-3 sm:flex-row sm:items-center">
          <p className="text-sm text-ink">
            <span className="font-medium">Some positions are currently unassigned.</span>{' '}
            <span className="text-muted">
              {summary.unassignedPositions} {summary.unassignedPositions === 1 ? 'position has' : 'positions have'} no active responsibility.
            </span>
          </p>
          <Button variant="secondary" size="sm" onClick={reviewUnassigned} className="sm:ml-auto">
            Review Unassigned Positions
          </Button>
        </div>
      }

      <Card bodyClassName="p-0">
        {loadState === 'error' ?
        <EmptyState
          icon={CloudOffIcon}
          title="Unable to load position responsibilities."
          description="Something went wrong while loading assignments. Please try again."
          action={<Button onClick={retry}>Try Again</Button>}
          className="py-16" /> :


        <>
            <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center">
              <SearchInput
              value={directory.query}
              onChange={directory.setQuery}
              label="Search position responsibilities"
              placeholder="Search position, code, department or area"
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
                label="Assignment status"
                value={status}
                onChange={(e) => setStatus(e.target.value as AssignmentStatusFilter)}
                className="sm:w-40"
                options={[
                { value: 'all', label: 'All statuses' },
                { value: 'assigned', label: 'Assigned' },
                { value: 'unassigned', label: 'Unassigned' },
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
          <LoadingState variant="table" rows={6} columns={5} label="Loading position responsibilities…" /> :
          directory.visible.length === 0 ?
          <EmptyState
            icon={assignments.length === 0 && !hasFilters ? ShieldCheckIcon : SearchXIcon}
            title="No position responsibilities found."
            description={
            hasFilters ?
            'Try adjusting your search or filters.' :
            'Assign administrative responsibility to a position to organize workforce ownership.'
            }
            action={
            hasFilters ?
            <Button variant="secondary" onClick={clearFilters}>
                      Clear filters
                    </Button> :
            undefined
            } /> :


          <AssignmentTable
            rows={directory.visible}
            sort={directory.sort}
            onSort={directory.toggleSort}
            onView={(r) => setViewingPositionId(r.position.id)}
            onAssign={openForm}
            onActivate={activate}
            onDeactivate={(r) =>
            r.assignment &&
            setDeactivating({ id: r.assignment.id, name: `the administrative responsibility for ${r.position.name}` })
            } />

          }
          </>
        }
      </Card>

      <AssignmentFormModal
        row={formRow}
        positions={positions}
        departments={departments}
        adminAreas={adminAreas}
        assignments={assignments}
        onClose={() => setFormPositionId(null)}
        onSubmit={submitForm} />
      
      <AssignmentDetailsModal row={viewingRow} employees={employees} onClose={() => setViewingPositionId(null)} onAssign={openForm} />
      <DeactivateRecordDialog
        noun="responsibility"
        request={deactivating}
        onClose={() => setDeactivating(null)}
        onConfirm={confirmDeactivate} />
      
    </div>);

}