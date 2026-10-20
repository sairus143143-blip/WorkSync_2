import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { attendanceRecords as seedRecords } from '../data/attendance';
import { workSchedule } from '../data/attendanceSchedule';
import type { AttendanceFormValues, AttendanceRecord, AttendanceStatus, WorkSchedule } from '../types/attendance';
import { NO_TIME_STATUSES } from '../utils/attendance';

interface AttendanceContextValue {
  schedule: WorkSchedule;
  records: AttendanceRecord[];
  /** Creates a record, or updates the one with editingId. Records are never deleted. */
  saveRecord: (values: AttendanceFormValues, editingId?: string) => AttendanceRecord;
}

const AttendanceContext = createContext<AttendanceContextValue | null>(null);

function toFields(values: AttendanceFormValues) {
  const status = values.status as AttendanceStatus;
  const noTimes = NO_TIME_STATUSES.includes(status);
  return {
    employeeId: values.employeeId,
    date: values.date,
    status,
    checkIn: noTimes ? null : values.checkIn || null,
    checkOut: noTimes ? null : values.checkOut || null,
    notes: values.notes.trim()
  };
}

/** Mock attendance store. Replace with API calls later. */
export function AttendanceProvider({ children }: {children: React.ReactNode;}) {
  const [records, setRecords] = useState<AttendanceRecord[]>(seedRecords);
  const counter = useRef(1);

  const saveRecord = useCallback((values: AttendanceFormValues, editingId?: string) => {
    const fields = toFields(values);
    if (editingId) {
      const updated = { id: editingId, ...fields };
      setRecords((current) => current.map((r) => r.id === editingId ? updated : r));
      return updated;
    }
    const created: AttendanceRecord = { id: `ATT-M${String(counter.current++).padStart(4, '0')}`, ...fields };
    setRecords((current) => [...current, created]);
    return created;
  }, []);

  const value = useMemo(() => ({ schedule: workSchedule, records, saveRecord }), [records, saveRecord]);
  return <AttendanceContext.Provider value={value}>{children}</AttendanceContext.Provider>;
}

export function useAttendance(): AttendanceContextValue {
  const context = useContext(AttendanceContext);
  if (!context) throw new Error('useAttendance must be used inside AttendanceProvider');
  return context;
}