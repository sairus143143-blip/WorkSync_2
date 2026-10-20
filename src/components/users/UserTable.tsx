import React from 'react';
import { EyeIcon, PencilIcon, UserCheckIcon, UserXIcon } from 'lucide-react';
import type { SystemUser, UserSort } from '../../types/users';
import { cn } from '../../utils/cn';
import { displayName, formatCreatedDate, formatLastActivity, isSystemAdmin } from '../../utils/users';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Table, type TableColumn } from '../ui/Table';
import { AccountStatusBadge } from './AccountStatusBadge';
import { ProtectedAccountIndicator } from './ProtectedAccountIndicator';
import { RoleBadge } from './RoleBadge';

interface UserTableProps {
  users: SystemUser[];
  sort: UserSort;
  onSort: (key: string) => void;
  onView: (user: SystemUser) => void;
  onEdit: (user: SystemUser) => void;
  onToggleStatus: (user: SystemUser) => void;
}

function ActionButton({ label, onClick, children }: {label: string;onClick: () => void;children: React.ReactNode;}) {
  return (
    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={label} title={label} onClick={onClick}>
      {children}
    </Button>);

}

export function UserTable({ users, sort, onSort, onView, onEdit, onToggleStatus }: UserTableProps) {
  const columns: TableColumn<SystemUser>[] = [
  {
    key: 'user',
    header: 'User',
    sortKey: 'name',
    render: (u) => {
      const name = displayName(u);
      const inactive = u.status === 'inactive';
      return (
        <div className={cn('flex min-w-[200px] items-center gap-3', inactive && 'opacity-60')}>
            <Avatar name={name} src={u.avatarUrl} />
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">{name}</p>
              <p className="truncate text-[13px] text-muted">
                <span className="md:hidden">{u.email}</span>
                <span className="hidden md:inline">
                  {isSystemAdmin(u) ? 'Protected System Administrator' : u.id}
                </span>
              </p>
            </div>
          </div>);

    }
  },
  {
    key: 'email',
    header: 'Email',
    hideBelow: 'md',
    render: (u) => <span className={cn(u.status === 'inactive' ? 'text-subtle' : 'text-muted')}>{u.email}</span>
  },
  { key: 'role', header: 'Role', render: (u) => <RoleBadge role={u.role} /> },
  { key: 'status', header: 'Status', sortKey: 'status', render: (u) => <AccountStatusBadge status={u.status} /> },
  {
    key: 'created',
    header: 'Created Date',
    sortKey: 'createdAt',
    hideBelow: 'lg',
    render: (u) => <span className="whitespace-nowrap text-muted">{formatCreatedDate(u.createdAt)}</span>
  },
  {
    key: 'activity',
    header: 'Last Activity',
    sortKey: 'lastActivity',
    hideBelow: 'sm',
    render: (u) =>
    <span className={cn('whitespace-nowrap', u.lastActivity ? 'text-muted' : 'text-subtle')}>
          {formatLastActivity(u.lastActivity)}
        </span>

  },
  {
    key: 'actions',
    header: 'Actions',
    align: 'right',
    render: (u) => {
      const name = displayName(u);
      if (isSystemAdmin(u)) {
        return (
          <div className="flex items-center justify-end gap-1">
              <ProtectedAccountIndicator />
              <ActionButton label={`View ${name}`} onClick={() => onView(u)}>
                <EyeIcon className="h-4 w-4" />
              </ActionButton>
            </div>);

      }
      const active = u.status === 'active';
      return (
        <div className="flex items-center justify-end gap-0.5">
            <ActionButton label={`View ${name}`} onClick={() => onView(u)}>
              <EyeIcon className="h-4 w-4" />
            </ActionButton>
            <ActionButton label={`Edit ${name}`} onClick={() => onEdit(u)}>
              <PencilIcon className="h-4 w-4" />
            </ActionButton>
            <ActionButton label={active ? `Deactivate ${name}` : `Activate ${name}`} onClick={() => onToggleStatus(u)}>
              {active ? <UserXIcon className="h-4 w-4 text-danger" /> : <UserCheckIcon className="h-4 w-4 text-success" />}
            </ActionButton>
          </div>);

    }
  }];


  return (
    <Table
      caption="User accounts"
      columns={columns}
      rows={users}
      getRowKey={(u) => u.id}
      sort={sort}
      onSort={onSort}
      getRowClassName={(u) => isSystemAdmin(u) ? 'bg-primary-soft/40' : undefined} />);


}