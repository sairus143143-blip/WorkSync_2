import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDownIcon, LogOutIcon, SettingsIcon, UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { roleLabels } from '../../utils/users';
import { Avatar } from '../ui/Avatar';
import { Dropdown, type DropdownItem } from '../ui/Dropdown';

interface ProfileMenuProps {
  onLogout: () => void;
}

export function ProfileMenu({ onLogout }: ProfileMenuProps) {
  const navigate = useNavigate();
  const { user, account } = useAuth();
  const displayName = user?.name ?? 'WorkSync user';
  const displayEmail = user?.email ?? '';
  const role = account?.role ?? 'employee';
  const roleLabel = roleLabels[role];

  const items: DropdownItem[] = [
  { id: 'profile', label: 'Profile', icon: UserIcon, onSelect: () => navigate('/profile') },
  ...(role === 'admin' ? [{ id: 'settings', label: 'Account Settings', icon: SettingsIcon, onSelect: () => navigate('/settings') }] : []),
  { id: 'logout', label: 'Log out', icon: LogOutIcon, tone: 'danger', separatorBefore: true, onSelect: onLogout }];


  return (
    <Dropdown
      triggerLabel={`Account menu for ${displayName}`}
      triggerClassName="flex items-center gap-2.5 rounded-lg p-1 hover:bg-ink/5 md:pr-2"
      trigger={
      <>
          <Avatar name={displayName} size="sm" />
          <span className="hidden text-left leading-tight md:block">
            <span className="block text-[13px] font-medium text-ink">{displayName}</span>
            <span className="block text-xs text-muted">{roleLabel}</span>
          </span>
          <ChevronDownIcon className="hidden h-4 w-4 text-subtle md:block" aria-hidden />
        </>
      }
      header={
      <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
          <Avatar name={displayName} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{displayName}</p>
            <p className="truncate text-xs text-muted">{displayEmail}</p>
          </div>
        </div>
      }
      items={items} />);


}
