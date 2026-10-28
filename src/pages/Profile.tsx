import { useState } from 'react';
import type { FormEvent } from 'react';
import { Alert } from '../components/ui/Alert';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { PageHeader } from '../components/ui/PageHeader';
import { Textarea } from '../components/ui/Textarea';
import { useAuth } from '../contexts/AuthContext';
import { useEmployees } from '../contexts/EmployeesContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { useToast } from '../contexts/ToastContext';
import { useUsers } from '../contexts/UsersContext';
import type { EmployeeFormErrors, EmployeeFormValues } from '../types/employees';
import { employmentStatusLabels, validateEmployeeForm } from '../utils/employees';
import { findPosition } from '../utils/organization';
import { roleLabels } from '../utils/users';

export function Profile() {
  const { user, account } = useAuth();
  const { employees, updateEmployee } = useEmployees();
  const { positions } = useOrganization();
  const { users } = useUsers();
  const { toast } = useToast();
  const employee = employees.find((record) => record.userId === user?.id);
  const position = employee ? findPosition(positions, employee.positionId) : undefined;
  const [errors, setErrors] = useState<EmployeeFormErrors>({});
  const [saved, setSaved] = useState(false);
  const [values, setValues] = useState<EmployeeFormValues>(() => employee ? {
    email: user?.email ?? '',
    password: '',
    confirmPassword: '',
    firstName: employee.firstName,
    middleName: employee.middleName,
    lastName: employee.lastName,
    phone: employee.phone,
    address: employee.address,
    avatar: employee.avatar,
    employeeNumber: employee.employeeNumber,
    positionId: employee.positionId,
    dateHired: employee.dateHired,
    employmentStatus: employee.employmentStatus
  } : {
    email: user?.email ?? '',
    password: '',
    confirmPassword: '',
    firstName: user?.name ?? '',
    middleName: '',
    lastName: '',
    phone: '',
    address: '',
    avatar: null,
    employeeNumber: '',
    positionId: '',
    dateHired: '',
    employmentStatus: ''
  });

  const setField = <K extends keyof EmployeeFormValues>(field: K, value: EmployeeFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setSaved(false);
  };

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!employee) return;
    const nextErrors = validateEmployeeForm(values, { employees, users, positions, editing: employee });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    updateEmployee(employee.id, values);
    setSaved(true);
    toast({ title: 'Profile saved', description: 'Your contact details and account name have been updated.' });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Review your WorkSync account and personal details." />
      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-4 border-b border-line pb-5">
          <Avatar name={user?.name ?? 'WorkSync user'} src={employee?.avatar ?? account?.avatarUrl} size="lg" />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold text-ink">{user?.name ?? 'WorkSync user'}</h2>
            <p className="truncate text-sm text-muted">{user?.email}</p>
          </div>
          {account && <Badge tone="primary">{roleLabels[account.role]}</Badge>}
        </div>

        {employee ? (
          <form onSubmit={save} noValidate className="space-y-5 pt-5">
            {saved && <Alert tone="success" title="Your profile changes have been saved." />}
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-ink">Personal and contact details</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="First name" autoComplete="given-name" required value={values.firstName} error={errors.firstName} onChange={(event) => setField('firstName', event.target.value)} />
                <Input label="Last name" autoComplete="family-name" required value={values.lastName} error={errors.lastName} onChange={(event) => setField('lastName', event.target.value)} />
                <Input label="Work email" type="email" autoComplete="email" required value={values.email} error={errors.email} onChange={(event) => setField('email', event.target.value)} />
                <Input label="Phone (optional)" type="tel" autoComplete="tel" value={values.phone} error={errors.phone} onChange={(event) => setField('phone', event.target.value)} />
                <Textarea label="Address (optional)" autoComplete="street-address" rows={3} className="sm:col-span-2" value={values.address} onChange={(event) => setField('address', event.target.value)} />
              </div>
            </fieldset>
            <fieldset className="space-y-3 border-t border-line pt-5">
              <legend className="text-sm font-semibold text-ink">Work information</legend>
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                <div><dt className="text-muted">Employee number</dt><dd className="mt-1 font-medium text-ink">{employee.employeeNumber}</dd></div>
                <div><dt className="text-muted">Position</dt><dd className="mt-1 font-medium text-ink">{position?.name ?? 'Not assigned'}</dd></div>
                <div><dt className="text-muted">Employment status</dt><dd className="mt-1 font-medium text-ink">{employmentStatusLabels[employee.employmentStatus]}</dd></div>
              </dl>
            </fieldset>
            <div className="flex justify-end border-t border-line pt-4">
              <Button type="submit">Save profile</Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 pt-5">
            <p className="text-sm text-muted">Your administrator account is protected and its details can’t be edited from this prototype.</p>
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="text-muted">Role</dt><dd className="mt-1 font-medium text-ink">{account ? roleLabels[account.role] : '—'}</dd></div>
              <div><dt className="text-muted">Account status</dt><dd className="mt-1 font-medium text-ink">{account?.status === 'active' ? 'Active' : 'Inactive'}</dd></div>
            </dl>
          </div>
        )}
      </Card>
      <p className="text-xs text-muted">WorkSync is a frontend prototype. Account data is stored in this browser; password and sign-in security are not managed here.</p>
    </div>
  );
}
