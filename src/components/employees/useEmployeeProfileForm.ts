import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import type { Employee, EmployeeFormErrors, EmployeeFormValues, EmployeeView } from '../../types/employees';
import type { Position } from '../../types/organization';
import type { SystemUser } from '../../types/users';
import { validateEmployeeForm } from '../../utils/employees';

interface Options {
  open: boolean;
  employees: Employee[];
  users: SystemUser[];
  positions: Position[];
  editing?: EmployeeView;
  suggestedNumber: string;
}

function initialValues(editing: EmployeeView | undefined, suggestedNumber: string): EmployeeFormValues {
  if (editing) {
    const e = editing.employee;
    return {
      email: editing.user?.email ?? '',
      password: '',
      confirmPassword: '',
      firstName: e.firstName,
      middleName: e.middleName,
      lastName: e.lastName,
      phone: e.phone,
      address: e.address,
      avatar: e.avatar,
      employeeNumber: e.employeeNumber,
      positionId: e.positionId,
      dateHired: e.dateHired,
      employmentStatus: e.employmentStatus
    };
  }
  return {
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    middleName: '',
    lastName: '',
    phone: '',
    address: '',
    avatar: null,
    employeeNumber: suggestedNumber,
    positionId: '',
    dateHired: format(new Date(), 'yyyy-MM-dd'),
    employmentStatus: 'active'
  };
}

/** Form state for the Add / Edit employee profile form. */
export function useEmployeeProfileForm({ open, employees, users, positions, editing, suggestedNumber }: Options) {
  const [values, setValues] = useState<EmployeeFormValues>(() => initialValues(editing, suggestedNumber));
  const [errors, setErrors] = useState<EmployeeFormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(initialValues(editing, suggestedNumber));
    setErrors({});
    setSubmitted(false);
    // Only reset when the dialog opens or the target changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing]);

  const ctx = { employees, users, positions, editing: editing?.employee };

  const setField = <K extends keyof EmployeeFormValues,>(field: K, value: EmployeeFormValues[K]) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (submitted) setErrors(validateEmployeeForm(next, ctx));
  };

  const validate = () => {
    setSubmitted(true);
    const nextErrors = validateEmployeeForm(values, ctx);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  return { values, errors, setField, validate };
}