import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { positions as seedPositions } from '../data/positions';
import type { Position, PositionInput, RecordStatus } from '../types/organization';
import { newPositionId } from '../utils/organization';

interface OrganizationContextValue {
  positions: Position[];
  createPosition: (input: PositionInput) => Position;
  updatePosition: (id: string, input: PositionInput) => void;
  setPositionStatus: (id: string, status: RecordStatus) => void;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

function positionFields(input: PositionInput) {
  return {
    name: input.name.trim(),
    code: input.code.trim().toUpperCase(),
    description: input.description.trim(),
    status: (input.status || 'active') as RecordStatus
  };
}

/**
 * Mock position store. IDs never change after creation, and records are deactivated
 * rather than deleted so employee history remains intact.
 */
export function OrganizationProvider({ children }: {children: React.ReactNode;}) {
  const [positions, setPositions] = useState<Position[]>(seedPositions);

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
      positions,
      createPosition,
      updatePosition,
      setPositionStatus
    }),
    [positions, createPosition, updatePosition, setPositionStatus]
  );

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
}

export function useOrganization(): OrganizationContextValue {
  const context = useContext(OrganizationContext);
  if (!context) throw new Error('useOrganization must be used inside OrganizationProvider');
  return context;
}