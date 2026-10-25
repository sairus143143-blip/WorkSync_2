import React from 'react';
import { useOrganization } from '../../contexts/OrganizationContext';
import type { EmploymentStatusFilter } from '../../types/employees';
import { Button } from '../ui/Button';
import { SearchInput } from '../ui/SearchInput';
import { Select } from '../ui/Select';

interface EmployeeFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  status: EmploymentStatusFilter;
  onStatusChange: (value: EmploymentStatusFilter) => void;
  positionId: string;
  onPositionChange: (value: string) => void;
  hasFilters: boolean;
  onClear: () => void;
  resultCount: number;
}

export function EmployeeFilters(props: EmployeeFiltersProps) {
  // Filters include inactive records so historical assignments stay findable.
  const { positions } = useOrganization();

  return (
    <div className="space-y-3 border-b border-line p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <SearchInput
          value={props.query}
          onChange={props.onQueryChange}
          label="Search employees"
          placeholder="Search name, employee no., email or position"
          className="xl:max-w-md" />
        
        <div className="grid gap-3 sm:grid-cols-2 xl:ml-auto xl:flex">
          <Select
            hideLabel
            label="Employment status"
            value={props.status}
            onChange={(e) => props.onStatusChange(e.target.value as EmploymentStatusFilter)}
            className="xl:w-40"
            options={[
            { value: 'all', label: 'All statuses' },
            { value: 'active', label: 'Active' },
            { value: 'on_leave', label: 'On Leave' },
            { value: 'inactive', label: 'Inactive' }]
            } />
          
          <Select
            hideLabel
            label="Position"
            value={props.positionId}
            onChange={(e) => props.onPositionChange(e.target.value)}
            className="xl:w-52"
            options={[{ value: 'all', label: 'All Positions' }, ...positions.map((p) => ({ value: p.id, label: p.name }))]} />
          
        </div>
      </div>
      <div className="flex items-center gap-3 text-[13px] text-muted">
        <p aria-live="polite">
          {props.resultCount} {props.resultCount === 1 ? 'employee' : 'employees'}
        </p>
        {props.hasFilters &&
        <Button variant="ghost" size="sm" onClick={props.onClear}>
            Clear filters
          </Button>
        }
      </div>
    </div>);

}