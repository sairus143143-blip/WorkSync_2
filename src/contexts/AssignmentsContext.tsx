import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { adminAreas as seedAreas } from '../data/adminAreas';
import { positionAdminAssignments as seedAssignments } from '../data/positionAdminAssignments';
import type { AdminArea, AssignmentInput, AssignmentStatus, PositionAdminAssignment } from '../types/assignments';
import { nextAssignmentId } from '../utils/assignments';

interface AssignmentsContextValue {
  adminAreas: AdminArea[];
  assignments: PositionAdminAssignment[];
  /** Creates the position's assignment, or updates it if one exists — never a duplicate. */
  saveAssignment: (input: AssignmentInput) => {created: boolean;record: PositionAdminAssignment;};
  setAssignmentStatus: (id: string, status: AssignmentStatus) => void;
}

const AssignmentsContext = createContext<AssignmentsContextValue | null>(null);

function nowIso() {
  const d = new Date();
  d.setMilliseconds(0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/**
 * Mock position → administrative area assignments. These never create user accounts;
 * the single system administrator controls every area. Replace with API calls later.
 */
export function AssignmentsProvider({ children }: {children: React.ReactNode;}) {
  const [adminAreas] = useState<AdminArea[]>(seedAreas);
  const [assignments, setAssignments] = useState<PositionAdminAssignment[]>(seedAssignments);

  const saveAssignment = useCallback(
    (input: AssignmentInput) => {
      const status = (input.status || 'assigned') as AssignmentStatus;
      const existing = assignments.find((a) => a.positionId === input.positionId);
      const record: PositionAdminAssignment = existing ?
      { ...existing, departmentId: input.departmentId, adminAreaId: input.adminAreaId, status, updatedAt: nowIso() } :
      {
        id: nextAssignmentId(assignments),
        positionId: input.positionId,
        departmentId: input.departmentId,
        adminAreaId: input.adminAreaId,
        status,
        updatedAt: nowIso()
      };
      setAssignments((current) => existing ? current.map((a) => a.id === existing.id ? record : a) : [...current, record]);
      return { created: !existing, record };
    },
    [assignments]
  );

  const setAssignmentStatus = useCallback((id: string, status: AssignmentStatus) => {
    setAssignments((current) => current.map((a) => a.id === id ? { ...a, status, updatedAt: nowIso() } : a));
  }, []);

  const value = useMemo(
    () => ({ adminAreas, assignments, saveAssignment, setAssignmentStatus }),
    [adminAreas, assignments, saveAssignment, setAssignmentStatus]
  );

  return <AssignmentsContext.Provider value={value}>{children}</AssignmentsContext.Provider>;
}

export function useAssignments(): AssignmentsContextValue {
  const context = useContext(AssignmentsContext);
  if (!context) throw new Error('useAssignments must be used inside AssignmentsProvider');
  return context;
}