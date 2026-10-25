/** Active/Inactive lifecycle for position records. Records are never deleted. */
export type RecordStatus = 'active' | 'inactive';

export interface Position {
  id: string;
  name: string;
  code: string;
  description: string;
  status: RecordStatus;
}

export interface PositionInput {
  name: string;
  code: string;
  description: string;
  status: RecordStatus | '';
}

export type PositionErrors = Partial<Record<keyof PositionInput, string>>;

export type PositionSortKey = 'name' | 'code' | 'employees' | 'status';

export interface SortState<K extends string> {
  key: K;
  direction: 'asc' | 'desc';
}

export type RecordStatusFilter = 'all' | RecordStatus;