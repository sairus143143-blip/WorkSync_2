import React, { useRef } from 'react';
import type { AttendanceRow, AttendanceStatus } from '../../types/attendance';
import { ATTENDANCE_STATUSES, ATTENDANCE_STATUS_LABELS, formatAttendanceDate, formatDuration, formatLate, formatTime } from '../../utils/attendance';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { AttendanceStatusBadge } from './AttendanceStatusBadge';

interface AttendanceDetailsModalProps {
  row: AttendanceRow | null;
  /** The employee's recent rows (most recent first), for the attendance summary. */
  recentRows: AttendanceRow[];
  onClose: () => void;
  onEdit: (row: AttendanceRow) => void;
}

function Field({ label, children }: {label: string;children: React.ReactNode;}) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink">{children}</dd>
    </div>);

}

export function AttendanceDetailsModal({ row: open, recentRows, onClose, onEdit }: AttendanceDetailsModalProps) {
  const last = useRef<AttendanceRow | null>(open);
  if (open) last.current = open;
  const row = open ?? last.current;

  const counts = recentRows.reduce(
    (acc, r) => ({ ...acc, [r.status]: acc[r.status] + 1 }),
    Object.fromEntries(ATTENDANCE_STATUSES.map((s) => [s, 0])) as Record<AttendanceStatus, number>
  );
  const recentWorked = recentRows.reduce((sum, r) => sum + r.workedMinutes, 0);

  return (
    <Modal
      open={open !== null}
      onClose={onClose}
      size="lg"
      title="Attendance Details"
      description={row ? formatAttendanceDate(row.date, 'EEEE, MMMM d, yyyy') : undefined}
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          {open && <Button onClick={() => onEdit(open)}>{open.derived ? 'Record Attendance' : 'Edit Attendance'}</Button>}
        </>
      }>
      
      {row &&
      <div className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar name={row.fullName} src={row.employee.avatar ?? undefined} size="lg" />
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-ink">{row.fullName}</h3>
              <p className="text-[13px] tabular-nums text-muted">{row.employee.employeeNumber}</p>
              <p className="text-[13px] text-muted">
                {row.position?.name ?? 'No position assigned'}
              </p>
            </div>
            <div className="ml-auto self-start">
              <AttendanceStatusBadge status={row.status} />
            </div>
          </div>

          <section className="border-t border-line pt-4">
            <h3 className="text-[13px] font-semibold text-ink">Attendance information</h3>
            <dl className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field label="Date">{formatAttendanceDate(row.date)}</Field>
              <Field label="Check in">
                <span className="tabular-nums">{formatTime(row.checkIn)}</span>
              </Field>
              <Field label="Check out">
                <span className="tabular-nums">{row.checkIn && !row.checkOut ? 'Not recorded' : formatTime(row.checkOut)}</span>
              </Field>
              <Field label="Working hours">
                <span className="tabular-nums">{row.status === 'incomplete' ? 'Incomplete' : formatDuration(row.workedMinutes)}</span>
              </Field>
              <Field label="Late">
                {row.checkIn ?
              row.lateMinutes > 0 ?
              <span className="text-warning">{formatLate(row.lateMinutes)}</span> :

              'On time' :


              '—'
              }
              </Field>
              <Field label="Overtime">
                <span className="tabular-nums">{row.overtimeMinutes > 0 ? formatLate(row.overtimeMinutes) : '0h'}</span>
              </Field>
              <div className="col-span-2 sm:col-span-3">
                <Field label="Notes">{row.notes || <span className="text-muted">No notes.</span>}</Field>
              </div>
            </dl>
            {row.derived && <p className="mt-3 text-[13px] text-muted">No record exists for this day yet. Use Record Attendance to add one.</p>}
          </section>

          <section className="border-t border-line pt-4">
            <h3 className="text-[13px] font-semibold text-ink">Recent attendance</h3>
            <p className="mt-0.5 text-[13px] text-muted">
              Last {recentRows.length} working {recentRows.length === 1 ? 'day' : 'days'} · {formatDuration(recentWorked)} worked
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {ATTENDANCE_STATUSES.filter((s) => counts[s] > 0).map((s) =>
            <li key={s} className="rounded-md bg-ink/[0.04] px-2.5 py-1 text-[13px] text-ink">
                  {ATTENDANCE_STATUS_LABELS[s]} <span className="font-medium tabular-nums">{counts[s]}</span>
                </li>
            )}
            </ul>
          </section>
        </div>
      }
    </Modal>);

}