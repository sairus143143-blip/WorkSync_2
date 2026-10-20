/** Active/Inactive lifecycle for organizational records. Records are never deleted. */
export type RecordStatus = 'active' | 'inactive';

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  status: RecordStatus;
}

/** A position belongs to exactly ONE department via departmentId. */
export interface Position {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  description: string;
  status: RecordStatus;
}

export interface DepartmentInput {
  name: string;
  code: string;
  description: string;
  status: RecordStatus | '';
}

export interface PositionInput {
  name: string;
  code: string;
  departmentId: string;
  description: string;
  status: RecordStatus | '';
}

export type DepartmentErrors = Partial<Record<keyof DepartmentInput, string>>;
export type PositionErrors = Partial<Record<keyof PositionInput, string>>;

export type DepartmentSortKey = 'name' | 'code' | 'employees' | 'positions' | 'status';
export type PositionSortKey = 'name' | 'code' | 'department' | 'employees' | 'status';

export interface SortState<K extends string> {
  key: K;
  direction: 'asc' | 'desc';
}

export type RecordStatusFilter = 'all' | RecordStatus;