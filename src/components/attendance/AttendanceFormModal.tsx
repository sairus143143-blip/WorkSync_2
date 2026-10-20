import React, { useId, useMemo, useState } from 'react';
import type { AttendanceFormValues, AttendanceRecord, AttendanceStatus, WorkSchedule } from '../../types/attendance';
import type { Employee } from '../../types/employees';
import {
  ATTENDANCE_STATUSES,
  ATTENDANCE_STATUS_LABELS,
  NO_TIME_STATUSES,
  formatDuration,
  formatTime,
  lateMinutes,
  overtimeMinutes,
  workedMinutes } from
'../../utils/attendance';
import { employeeFullName } from '../../utils/employees';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { useAttendanceForm } from './useAttendanceForm';

export interface AttendanceFormTarget {
  /** Present when editing an existing record. */
  record?: AttendanceRecord;
  /** Pre-filled employee/date, e.g. when recording for an absent row. */
  employeeId?: string;
  date?: string;
}

interface AttendanceFormModalProps {
  target: AttendanceFormTarget | null;
  employees: Employee[];
  records: AttendanceRecord[];
  schedule: WorkSchedule;
  defaultDate: string;
  onClose: () => void;
  onSubmit: (values: AttendanceFormValues, editingId?: string) => void;
}

function initialValues(target: AttendanceFormTarget | null, defaultDate: string): AttendanceFormValues {
  const r = target?.record;
  if (r) {
    return { employeeId: r.employeeId, date: r.date, status: r.status, checkIn: r.checkIn ?? '', checkOut: r.checkOut ?? '', notes: r.notes };
  }
  return { employeeId: target?.employeeId ?? '', date: target?.date ?? defaultDate, status: '', checkIn: '', checkOut: '', notes: '' };
}

export function AttendanceFormModal({ target, employees, records, schedule, defaultDate, onClose, onSubmit }: AttendanceFormModalProps) {
  const [saving, setSaving] = useState(false);
  const formId = useId();
  const open = target !== null;
  const editing = target?.record;
  const resetKey = editing?.id ?? `${target?.employeeId ?? ''}-${target?.date ?? ''}-${open}`;

  const initial = useMemo(() => initialValues(target, defaultDate), [target, defaultDate]);
  const { values, errors, setField, validate } = useAttendanceForm({
    open,
    initial,
    resetKey,
    editingId: editing?.id,
    records,
    employees,
    schedule
  });

  // Active and on-leave employees are offered; the current employee stays listed when editing.
  const employeeOptions = employees.
  filter((e) => e.employmentStatus !== 'inactive' || e.id === values.employeeId).
  map((e) => ({
    value: e.id,
    label: `${employeeFullName(e)} · ${e.employeeNumber}${e.employmentStatus === 'on_leave' ? ' (On leave)' : e.employmentStatus === 'inactive' ? ' (Inactive)' : ''}`
  })).
  sort((a, b) => a.label.localeCompare(b.label));

  const timesDisabled = NO_TIME_STATUSES.includes(values.status as AttendanceStatus);
  const worked = workedMinutes(values.checkIn || null, values.checkOut || null, schedule);
  const late = lateMinutes(values.checkIn || null, schedule);
  const overtime = overtimeMinutes(values.checkOut || null, schedule);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setSaving(true);
    window.setTimeout(() => {
      onSubmit(values, editing?.id);
      setSaving(false);
    }, 400);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Attendance' : 'Record Attendance'}
      description={`Standard schedule: ${formatTime(schedule.expectedStart)} – ${formatTime(schedule.expectedEnd)}, lunch ${formatTime(schedule.lunchStart)} – ${formatTime(schedule.lunchEnd)}.`}
      footer={
      <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={saving}>
            Save Attendance
          </Button>
        </>
      }>
      
      <form id={formId} onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Employee"
          value={values.employeeId}
          onChange={(e) => setField('employeeId', e.target.value)}
          error={errors.employeeId}
          className="sm:col-span-2"
          options={[{ value: '', label: 'Select an employee' }, ...employeeOptions]} />
        
        <Input label="Date" type="date" max={schedule.today} value={values.date} onChange={(e) => setField('date', e.target.value)} error={errors.date} />
        <Select
          label="Attendance status"
          value={values.status}
          onChange={(e) => setField('status', e.target.value as AttendanceStatus | '')}
          error={errors.status}
          options={[{ value: '', label: 'Select a status' }, ...ATTENDANCE_STATUSES.map((s) => ({ value: s, label: ATTENDANCE_STATUS_LABELS[s] }))]} />
        
        <Input
          label="Check in"
          type="time"
          value={values.checkIn}
          onChange={(e) => setField('checkIn', e.target.value)}
          error={errors.checkIn}
          disabled={timesDisabled}
          hint={timesDisabled ? 'Not needed for this status.' : undefined} />
        
        <Input
          label="Check out"
          type="time"
          value={values.checkOut}
          onChange={(e) => setField('checkOut', e.target.value)}
          error={errors.checkOut}
          disabled={timesDisabled}
          hint={!timesDisabled && values.status === 'incomplete' ? 'Leave empty when the employee didn’t check out.' : undefined} />
        

        {!timesDisabled && values.checkIn &&
        <dl className="grid grid-cols-3 gap-3 rounded-lg border border-line bg-bg px-4 py-3 sm:col-span-2">
            <div>
              <dt className="text-xs text-muted">Working hours</dt>
              <dd className="mt-0.5 text-sm font-medium tabular-nums text-ink">{values.checkOut ? formatDuration(worked) : '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Arrival</dt>
              <dd className={`mt-0.5 text-sm font-medium tabular-nums ${late > 0 ? 'text-warning' : 'text-ink'}`}>
                {late > 0 ? `Late by ${late} min` : 'On time'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Overtime</dt>
              <dd className="mt-0.5 text-sm font-medium tabular-nums text-ink">{formatDuration(overtime)}</dd>
            </div>
          </dl>
        }

        <Textarea
          label="Notes (optional)"
          placeholder="e.g. Traffic delay, approved half day…"
          value={values.notes}
          onChange={(e) => setField('notes', e.target.value)}
          className="sm:col-span-2" />
        
      </form>
    </Modal>);

}