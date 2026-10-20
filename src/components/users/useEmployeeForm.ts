import { useEffect, useState } from 'react';
import type { EmployeeAccountErrors, EmployeeAccountInput, SystemUser } from '../../types/users';
import { validateEmployeeAccount } from '../../utils/users';

const emptyForm: EmployeeAccountInput = { firstName: '', lastName: '', email: '', status: 'active' };

/** Form state for creating or editing an employee account. */
export function useEmployeeForm(open: boolean, users: SystemUser[], editing?: SystemUser) {
  const [values, setValues] = useState<EmployeeAccountInput>(emptyForm);
  const [errors, setErrors] = useState<EmployeeAccountErrors>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(
      editing ?
      {
        firstName: editing.firstName,
        lastName: editing.lastName,
        email: editing.email,
        status: editing.status,
        avatarUrl: editing.avatarUrl
      } :
      emptyForm
    );
    setErrors({});
    setSubmitted(false);
  }, [open, editing]);

  const setField = <K extends keyof EmployeeAccountInput,>(field: K, value: EmployeeAccountInput[K]) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (submitted) setErrors(validateEmployeeAccount(next, users, editing?.id));
  };

  /** Returns true when the form is valid. */
  const validate = () => {
    setSubmitted(true);
    const nextErrors = validateEmployeeAccount(values, users, editing?.id);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  return { values, errors, setField, validate };
}