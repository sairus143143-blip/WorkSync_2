import React, { useEffect, useState } from 'react';
import { PlusIcon, SearchXIcon } from 'lucide-react';
import { DeactivateUserDialog } from '../components/users/DeactivateUserDialog';
import { EmployeeFormModal } from '../components/users/EmployeeFormModal';
import { UserDetailsModal } from '../components/users/UserDetailsModal';
import { UserFilters } from '../components/users/UserFilters';
import { UserSummary } from '../components/users/UserSummary';
import { UserTable } from '../components/users/UserTable';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { PageHeader } from '../components/ui/PageHeader';
import { useToast } from '../contexts/ToastContext';
import { useUsers } from '../contexts/UsersContext';
import { useUserDirectory } from '../hooks/useUserDirectory';
import type { EmployeeAccountInput, SystemUser } from '../types/users';
import { canModifyUser, displayName } from '../utils/users';

interface FormState {
  open: boolean;
  editing?: SystemUser;
}

export function Users() {
  const { users, createEmployee, updateEmployee, setEmployeeStatus } = useUsers();
  const { toast } = useToast();
  const directory = useUserDirectory(users);

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState>({ open: false });
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [deactivating, setDeactivating] = useState<SystemUser | null>(null);

  // Simulates the first fetch so the table's loading state is visible; replace with a real request later.
  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 450);
    return () => window.clearTimeout(timer);
  }, []);

  const viewing = users.find((u) => u.id === viewingId) ?? null;

  const openAdd = () => setForm({ open: true });
  const openEdit = (user: SystemUser) => {
    if (!canModifyUser(user)) return;
    setViewingId(null);
    setForm({ open: true, editing: user });
  };
  const closeForm = () => setForm((current) => ({ ...current, open: false }));

  const submitForm = (input: EmployeeAccountInput) => {
    if (form.editing) {
      updateEmployee(form.editing.id, input);
      toast({ title: 'Employee information updated successfully.' });
    } else {
      const created = createEmployee(input);
      toast({ title: 'Employee account created successfully.', description: `${displayName(created)} was added as an Employee.` });
    }
    closeForm();
  };

  const toggleStatus = (user: SystemUser) => {
    if (!canModifyUser(user)) return;
    if (user.status === 'active') {
      setDeactivating(user);
    } else {
      setEmployeeStatus(user.id, 'active');
      toast({ title: 'Employee account activated.', description: `${displayName(user)} can sign in again.` });
    }
  };

  const confirmDeactivate = (user: SystemUser) => {
    setEmployeeStatus(user.id, 'inactive');
    setDeactivating(null);
    toast({ tone: 'info', title: 'Employee account deactivated.', description: `${displayName(user)} can no longer sign in.` });
  };

  const addButton =
  <Button leftIcon={<PlusIcon className="h-4 w-4" />} onClick={openAdd}>
      Add Employee
    </Button>;


  return (
    <div className="space-y-6">
      <PageHeader title="User Management" description="Manage employee user accounts and system access." actions={addButton} />

      <UserSummary users={users} />

      <Card bodyClassName="p-0">
        <UserFilters
          query={directory.query}
          onQueryChange={directory.setQuery}
          role={directory.role}
          onRoleChange={directory.setRole}
          status={directory.status}
          onStatusChange={directory.setStatus}
          hasFilters={directory.hasFilters}
          onClear={directory.clearFilters}
          resultCount={directory.visible.length} />
        
        {loading ?
        <LoadingState variant="table" rows={6} columns={4} label="Loading users…" /> :
        directory.visible.length === 0 ?
        <EmptyState
          icon={SearchXIcon}
          title="No users found."
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


        <UserTable
          users={directory.visible}
          sort={directory.sort}
          onSort={directory.toggleSort}
          onView={(u) => setViewingId(u.id)}
          onEdit={openEdit}
          onToggleStatus={toggleStatus} />

        }
      </Card>

      <EmployeeFormModal open={form.open} editing={form.editing} users={users} onClose={closeForm} onSubmit={submitForm} />
      <UserDetailsModal user={viewing} onClose={() => setViewingId(null)} onEdit={openEdit} />
      <DeactivateUserDialog user={deactivating} onClose={() => setDeactivating(null)} onConfirm={confirmDeactivate} />
    </div>);

}