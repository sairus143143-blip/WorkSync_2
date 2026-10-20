import React from 'react';
import { ShieldCheckIcon, UserCheckIcon, UsersIcon, UserXIcon, UsersRoundIcon } from 'lucide-react';
import type { SystemUser } from '../../types/users';
import { summarizeUsers } from '../../utils/users';
import { StatCard } from '../ui/StatCard';

export function UserSummary({ users }: {users: SystemUser[];}) {
  const s = summarizeUsers(users);

  return (
    <section aria-label="User summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <StatCard label="Total Users" value={String(s.total)} icon={UsersIcon} tone="neutral" hint="All accounts in WorkSync" />
      <StatCard label="Active Users" value={String(s.active)} icon={UserCheckIcon} tone="success" hint="Can sign in" />
      <StatCard label="Inactive Users" value={String(s.inactive)} icon={UserXIcon} tone="warning" hint="Access disabled" />
      <StatCard label="Employees" value={String(s.employees)} icon={UsersRoundIcon} tone="primary" hint="Regular workforce users" />
      <StatCard label="System Administrator" value={String(s.administrators)} icon={ShieldCheckIcon} tone="primary" hint="Protected account" />
    </section>);

}