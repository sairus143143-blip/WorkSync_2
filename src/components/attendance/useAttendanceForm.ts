import { useEffect, useState } from 'react';
import type { AttendanceFormErrors, AttendanceFormValues, AttendanceRecord, AttendanceStatus, WorkSchedule } from '../../types/attendance';
import type { Employee } from '../../types/employees';
import { NO_TIME_STATUSES, suggestStatus, validateAttendance } from '../../utils/attendance';

interface Options {
  open: boolean;
  initial: AttendanceFormValues;
  /** Changes whenever a different record/target opens, to trigger a reset. */
  resetKey: string;
  editingId?: string;
  records: AttendanceRecord[];
  employees: Employee[];
  schedule: WorkSchedule;
}

/**
 * Form state for Record / Edit Attendance. Until the admin picks a status manually,
 * the status follows the entered times (e.g. a check-in after 8:00 AM suggests Late).
 */
export function useAttendanceForm({ open, initial, resetKey, editingId, records, employees, schedule }: Options) {
  const [values, setValues] = useState<AttendanceFormValues>(initial);
  const [errors, setErrors] = useState<AttendanceFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [statusTouched, setStatusTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(initial);
    setErrors({});
    setSubmitted(false);
    // Existing records keep their chosen status; new ones follow the times.
    setStatusTouched(Boolean(editingId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, resetKey]);

  const ctx = { records, employees, schedule, editingId };

  const setField = <K extends keyof AttendanceFormValues,>(field: K, value: AttendanceFormValues[K]) => {
    const next = { ...values, [field]: value };
    if (field === 'status') {
      setStatusTouched(true);
      if (NO_TIME_STATUSES.includes(value as AttendanceStatus)) {
        next.checkIn = '';
        next.checkOut = '';
      }
    }
    if ((field === 'checkIn' || field === 'checkOut') && !statusTouched) {
      const suggested = suggestStatus(next.checkIn, next.checkOut, schedule);
      if (suggested) next.status = suggested;
    }
    setValues(next);
    if (submitted) setErrors(validateAttendance(next, ctx));
  };

  const validate = () => {
    setSubmitted(true);
    const nextErrors = validateAttendance(values, ctx);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  return { values, errors, setField, validate };
}