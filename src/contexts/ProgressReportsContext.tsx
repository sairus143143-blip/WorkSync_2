import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ProgressReport, ProgressReportReviewEvent, ProgressReportVersion, ProgressReviewAction } from '../types/progressReports';
import { employeeFullName } from '../utils/employees';
import { getTaskReportPeriods, isPeriodElapsed } from '../utils/progressReports';
import { useAuth } from './AuthContext';
import { useEmployees } from './EmployeesContext';
import { useTasks } from './TasksContext';
import { useNotifications } from './NotificationContext';

interface ProgressReportsContextValue {
  reports: ProgressReport[];
  submitReport: (taskId: string, periodStart: string, summary: string) => string | null;
  reviewReport: (reportId: string, action: ProgressReviewAction, feedback: string) => boolean;
}

const STORAGE_KEY = 'worksync.progressReports.v1';
const ProgressReportsContext = createContext<ProgressReportsContextValue | null>(null);

function readReports(): ProgressReport[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed as ProgressReport[] : [];
  } catch {
    return [];
  }
}

function nextId(prefix: string, values: Array<{ id: string }>): string {
  return `${prefix}-${String(values.length + 1).padStart(4, '0')}`;
}

export function ProgressReportsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { employees } = useEmployees();
  const { tasks } = useTasks();
  const { addNotification } = useNotifications();
  const [reports, setReports] = useState<ProgressReport[]>(readReports);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    } catch {
      // Storage may be unavailable in a sandboxed preview.
    }
  }, [reports]);

  const submitReport = useCallback((taskId: string, periodStart: string, summary: string): string | null => {
    if (user?.role !== 'employee' || summary.trim().length < 10) return null;
    const employee = employees.find((item) => item.userId === user.id);
    const task = tasks.find((item) => item.id === taskId);
    if (!employee || !task || task.assignedEmployeeId !== employee.id) return null;
    const period = getTaskReportPeriods(task).find((item) => item.startDate === periodStart);
    if (!period || !isPeriodElapsed(period)) return null;

    const existing = reports.find((report) =>
      report.taskId === taskId && report.employeeId === employee.id && report.periodStart === periodStart
    );
    if (existing && existing.status !== 'needs_revision') return null;

    const version: ProgressReportVersion = {
      id: nextId('VER', reports.flatMap((report) => report.versions)),
      summary: summary.trim(),
      progress: task.progress,
      taskStatus: task.status,
      submittedAt: new Date().toISOString()
    };
    if (existing) {
      setReports((current) => current.map((report) => report.id === existing.id
        ? { ...report, status: 'submitted', versions: [...report.versions, version] }
        : report));
      addNotification({ title: 'Weekly report resubmitted', message: `${employee.firstName} ${employee.lastName} resubmitted ${task.taskCode} for ${period.startDate}.`, type: 'system', recipientId: 'admin', relatedEntityId: existing.id, destination: '/weekly-reports' });
      return existing.id;
    }

    const report: ProgressReport = {
      id: nextId('RPT', reports),
      taskId: task.id,
      taskCode: task.taskCode,
      taskTitle: task.title,
      employeeId: employee.id,
      employeeName: employeeFullName(employee),
      periodStart: period.startDate,
      periodEnd: period.endDate,
      status: 'submitted',
      versions: [version],
      reviewEvents: []
    };
    setReports((current) => [...current, report]);
    addNotification({ title: 'Weekly report submitted', message: `${employee.firstName} ${employee.lastName} submitted ${task.taskCode} for ${period.startDate}.`, type: 'system', recipientId: 'admin', relatedEntityId: report.id, destination: '/weekly-reports' });
    return report.id;
  }, [addNotification, employees, reports, tasks, user]);

  const reviewReport = useCallback((reportId: string, action: ProgressReviewAction, feedback: string): boolean => {
    if (user?.role !== 'admin') return false;
    const report = reports.find((item) => item.id === reportId);
    const latestVersion = report?.versions[report.versions.length - 1];
    if (!report || !latestVersion || action === 'revision_requested' && !feedback.trim()) return false;
    const event: ProgressReportReviewEvent = {
      id: `REV-${String(report.reviewEvents.length + 1).padStart(4, '0')}`,
      versionId: latestVersion.id,
      action,
      feedback: feedback.trim(),
      reviewerUserId: user.id,
      reviewerName: user.name,
      createdAt: new Date().toISOString()
    };
    setReports((current) => current.map((item) => item.id === reportId
      ? { ...item, status: action === 'reviewed' ? 'reviewed' : 'needs_revision', reviewEvents: [...item.reviewEvents, event] }
      : item));
    const employee = employees.find((item) => item.id === report.employeeId);
    if (employee?.userId) addNotification({ title: action === 'reviewed' ? 'Weekly report reviewed' : 'Revision requested', message: `Your report for ${report.taskCode} (${report.periodStart}) was ${action === 'reviewed' ? 'reviewed' : 'returned for revision'}.${feedback.trim() ? ` ${feedback.trim()}` : ''}`, type: 'system', recipientId: employee.userId, relatedEntityId: report.id, destination: '/my-reports' });
    return true;
  }, [addNotification, employees, reports, user]);

  const value = useMemo(() => ({ reports, submitReport, reviewReport }), [reports, submitReport, reviewReport]);
  return <ProgressReportsContext.Provider value={value}>{children}</ProgressReportsContext.Provider>;
}

export function useProgressReports(): ProgressReportsContextValue {
  const context = useContext(ProgressReportsContext);
  if (!context) throw new Error('useProgressReports must be used inside ProgressReportsProvider');
  return context;
}