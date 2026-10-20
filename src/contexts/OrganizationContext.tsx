import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { departments as seedDepartments } from '../data/departments';
import { positions as seedPositions } from '../data/positions';
import type { Department, DepartmentInput, Position, PositionInput, RecordStatus } from '../types/organization';
import { newDepartmentId, newPositionId } from '../utils/organization';

interface OrganizationContextValue {
  departments: Department[];
  positions: Position[];
  createDepartment: (input: DepartmentInput) => Department;
  updateDepartment: (id: string, input: DepartmentInput) => void;
  setDepartmentStatus: (id: string, status: RecordStatus) => void;
  createPosition: (input: PositionInput) => Position;
  updatePosition: (id: string, input: PositionInput) => void;
  setPositionStatus: (id: string, status: RecordStatus) => void;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

function departmentFields(input: DepartmentInput) {
  return {
    name: input.name.trim(),
    code: input.code.trim().toUpperCase(),
    description: input.description.trim(),
    status: (input.status || 'active') as RecordStatus
  };
}

function positionFields(input: PositionInput) {
  return {
    name: input.name.trim(),
    code: input.code.trim().toUpperCase(),
    departmentId: input.departmentId,
    description: input.description.trim(),
    status: (input.status || 'active') as RecordStatus
  };
}

/**
 * Mock organizational structure (Department → Position). IDs never change after creation,
 * and nothing is deleted — deactivation preserves history. Replace with API calls later.
 */
export function OrganizationProvider({ children }: {children: React.ReactNode;}) {
  const [departments, setDepartments] = useState<Department[]>(seedDepartments);
  const [positions, setPositions] = useState<Position[]>(seedPositions);

  const createDepartment = useCallback(
    (input: DepartmentInput) => {
      const fields = departmentFields(input);
      const record: Department = { id: newDepartmentId(departments, fields.code), ...fields };
      setDepartments((current) => [...current, record]);
      return record;
    },
    [departments]
  );

  const updateDepartment = useCallback((id: string, input: DepartmentInput) => {
    setDepartments((current) => current.map((d) => d.id === id ? { ...d, ...departmentFields(input), id: d.id } : d));
  }, []);

  const setDepartmentStatus = useCallback((id: string, status: RecordStatus) => {
    setDepartments((current) => current.map((d) => d.id === id ? { ...d, status } : d));
  }, []);

  const createPosition = useCallback(
    (input: PositionInput) => {
      const fields = positionFields(input);
      const record: Position = { id: newPositionId(positions, fields.code), ...fields };
      setPositions((current) => [...current, record]);
      return record;
    },
    [positions]
  );

  const updatePosition = useCallback((id: string, input: PositionInput) => {
    setPositions((current) => current.map((p) => p.id === id ? { ...p, ...positionFields(input), id: p.id } : p));
  }, []);

  const setPositionStatus = useCallback((id: string, status: RecordStatus) => {
    setPositions((current) => current.map((p) => p.id === id ? { ...p, status } : p));
  }, []);

  const value = useMemo(
    () => ({
      departments,
      positions,
      createDepartment,
      updateDepartment,
      setDepartmentStatus,
      createPosition,
      updatePosition,
      setPositionStatus
    }),
    [departments, positions, createDepartment, updateDepartment, setDepartmentStatus, createPosition, updatePosition, setPositionStatus]
  );

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
}

export function useOrganization(): OrganizationContextValue {
  const context = useContext(OrganizationContext);
  if (!context) throw new Error('useOrganization must be used inside OrganizationProvider');
  return context;
}