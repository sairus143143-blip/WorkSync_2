import React from 'react';
import type { RoleFilter, StatusFilter } from '../../types/users';
import { Button } from '../ui/Button';
import { SearchInput } from '../ui/SearchInput';
import { Select } from '../ui/Select';

interface UserFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  role: RoleFilter;
  onRoleChange: (value: RoleFilter) => void;
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  hasFilters: boolean;
  onClear: () => void;
  resultCount: number;
}

export function UserFilters({
  query,
  onQueryChange,
  role,
  onRoleChange,
  status,
  onStatusChange,
  hasFilters,
  onClear,
  resultCount
}: UserFiltersProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center">
      <SearchInput
        value={query}
        onChange={onQueryChange}
        label="Search users"
        placeholder="Search by name, email or user ID"
        className="lg:max-w-sm" />
      
      <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center lg:ml-auto">
        <Select
          hideLabel
          label="Role"
          value={role}
          onChange={(e) => onRoleChange(e.target.value as RoleFilter)}
          className="sm:w-40"
          options={[
          { value: 'all', label: 'All roles' },
          { value: 'admin', label: 'Admin' },
          { value: 'employee', label: 'Employee' }]
          } />
        
        <Select
          hideLabel
          label="Status"
          value={status}
          onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
          className="sm:w-40"
          options={[
          { value: 'all', label: 'All statuses' },
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' }]
          } />
        
        <p className="col-span-2 text-[13px] text-muted sm:col-span-1 sm:whitespace-nowrap" aria-live="polite">
          {resultCount} {resultCount === 1 ? 'user' : 'users'}
        </p>
        {hasFilters &&
        <Button variant="ghost" size="sm" onClick={onClear} className="col-span-2 justify-self-start sm:col-span-1">
            Clear filters
          </Button>
        }
      </div>
    </div>);

}