import React, { useMemo, useState } from 'react';
import { format, parseISO, subDays } from 'date-fns';
import { CloudOffIcon, DownloadIcon, PlusIcon } from 'lucide-react';
import { AttendanceDetailsModal } from '../components/attendance/AttendanceDetailsModal';
import { AttendanceFormModal, type AttendanceFormTarget } from '../components/attendance/AttendanceFormModal';
import { AttendanceHistoryPanel } from '../components/attendance/AttendanceHistoryPanel';
import { AttendanceSummary } from '../components/attendance/AttendanceSummary';
import { DailyAttendancePanel } from '../components/attendance/DailyAttendancePanel';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { PageHeader } from '../components/ui/PageHeader';
import { Tabs, tabPanelProps } from '../components/ui/Tabs';
import { useAttendance } from '../contexts/AttendanceContext';
import { useEmployees } from '../contexts/EmployeesContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { useToast } from '../contexts/ToastContext';
import { useSimulatedLoad } from '../hooks/useSimulatedLoad';
import type { AttendanceFormValues, AttendanceRow } from '../types/attendance';
import { buildDailyRows, buildRangeRows, formatAttendanceDate, isWorkingDay } from '../utils/attendance';

interface AttendanceProps {
  /** Prototype control: first load fails so the error state can be reviewed. */
  simulateLoadError?: boolean;
}

type AttendanceTab = 'daily' | 'history';

export function Attendance({ simulateLoadError = false }: AttendanceProps) {
  const { schedule, records, saveRecord } = useAttendance();
  const { employees } = useEmployees();
  const { departments, positions } = useOrganization();
  const { toast } = useToast();
  const { state: loadState, retry } = useSimulatedLoad(simulateLoadError);

  const [tab, setTab] = useState<AttendanceTab>('daily');
  const [date, setDate] = useState(schedule.today);
  const [formTarget, setFormTarget] = useState<AttendanceFormTarget | null>(null);
  const [viewing, setViewing] = useState<{employeeId: string;date: string;} | null>(null);

  const ctx = useMemo(() => ({ employees, records, departments, positions, schedule }), [employees, records, departments, positions, schedule]);
  const dailyRows = useMemo(() => buildDailyRows(date, ctx), [date, ctx]);
  const dayLabel = date === schedule.today ? 'Today' : formatAttendanceDate(date, 'MMM d');

  // Resolve the viewed row from live data so edits show immediately.
  const viewingRow = useMemo(() => {
    if (!viewing) return null;
    return buildDailyRows(viewing.date, ctx).find((r) => r.employee.id === viewing.employeeId) ?? null;
  }, [viewing, ctx]);
  const recentRows = useMemo(() => {
    if (!viewingRow) return [];
    // The employee's last 10 working days up to the viewed date.
    const from = format(subDays(parseISO(viewingRow.date), 20), 'yyyy-MM-dd');
    return buildRangeRows(from, viewingRow.date, ctx).
    filter((r) => r.employee.id === viewingRow.employee.id && isWorkingDay(r.date)).
    slice(-10);
  }, [viewingRow, ctx]);

  const openView = (row: AttendanceRow) => setViewing({ employeeId: row.employee.id, date: row.date });
  const openEdit = (row: AttendanceRow) => {
    setViewing(null);
    setFormTarget(row.record ? { record: row.record } : { employeeId: row.employee.id, date: row.date });
  };

  const submitForm = (values: AttendanceFormValues, editingId?: string) => {
    saveRecord(values, editingId);
    toast({ title: editingId ? 'Attendance record updated successfully.' : 'Attendance recorded successfully.' });
    setFormTarget(null);
  };

  const exportReport = () =>
  toast({ tone: 'info', title: 'Export isn’t available in this prototype.', description: 'Attendance report exports will be added in a later phase.' });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Management"
        description="Monitor employee attendance, working hours, punctuality, and daily attendance status."
        actions={
        <>
            <Button variant="secondary" leftIcon={<DownloadIcon className="h-4 w-4" />} onClick={exportReport}>
              Export Report
            </Button>
            <Button leftIcon={<PlusIcon className="h-4 w-4" />} onClick={() => setFormTarget({ date })}>
              Record Attendance
            </Button>
          </>
        } />
      

      {loadState === 'error' ?
      <Card>
          <EmptyState
          icon={CloudOffIcon}
          title="Unable to load attendance records."
          description="Something went wrong while loading attendance. Please try again."
          action={<Button onClick={retry}>Try Again</Button>}
          className="py-16" />
        
        </Card> :
      loadState === 'loading' ?
      <Card bodyClassName="p-0">
          <LoadingState variant="table" rows={7} columns={6} label="Loading attendance records…" />
        </Card> :

      <>
          <AttendanceSummary rows={dailyRows} dayLabel={dayLabel} />

          <div>
            <Tabs
            label="Attendance views"
            idPrefix="attendance"
            value={tab}
            onChange={setTab}
            items={[
            { value: 'daily', label: "Today's Attendance" },
            { value: 'history', label: 'Attendance History' }]
            } />
          
            <div className="pt-5" {...tabPanelProps('attendance', tab)}>
              {tab === 'daily' ?
            <DailyAttendancePanel
              rows={dailyRows}
              date={date}
              today={schedule.today}
              departments={departments}
              positions={positions}
              onDateChange={setDate}
              onView={openView}
              onEdit={openEdit} /> :


            <AttendanceHistoryPanel
              employees={employees}
              records={records}
              departments={departments}
              positions={positions}
              schedule={schedule}
              onView={openView} />

            }
            </div>
          </div>
        </>
      }

      <AttendanceFormModal
        target={formTarget}
        employees={employees}
        records={records}
        schedule={schedule}
        defaultDate={date}
        onClose={() => setFormTarget(null)}
        onSubmit={submitForm} />
      
      <AttendanceDetailsModal row={viewingRow} recentRows={recentRows} onClose={() => setViewing(null)} onEdit={openEdit} />
    </div>);

}