import React, { forwardRef } from 'react';
import { UserMinusIcon, UserPlusIcon, UsersRoundIcon } from 'lucide-react';
import type { Employee } from '../../types/employees';
import type { Position } from '../../types/organization';
import type { ProjectMember } from '../../types/projects';
import { employeeFullName, employmentStatusLabels } from '../../utils/employees';
import { findPosition } from '../../utils/organization';
import { formatProjectDate } from '../../utils/projects';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { IconButton } from '../ui/IconButton';
import { Table, type TableColumn } from '../ui/Table';

interface MemberRow {
  member: ProjectMember;
  employee: Employee;
  name: string;
  position?: Position;
}

interface ProjectMembersCardProps {
  members: ProjectMember[];
  employees: Employee[];
  positions: Position[];
  summary: {teamMembers: number;activeMembers: number;};
  onAdd: () => void;
  onRemove: (member: ProjectMember, name: string) => void;
}

export const ProjectMembersCard = forwardRef<HTMLDivElement, ProjectMembersCardProps>(function ProjectMembersCard(
{ members, employees, positions, summary, onAdd, onRemove },
ref)
{
  const rows: MemberRow[] = members.
  map((member) => {
    const employee = employees.find((e) => e.id === member.employeeId);
    if (!employee) return null;
    return {
      member,
      employee,
      name: employeeFullName(employee),
      position: findPosition(positions, employee.positionId)
    };
  }).
  filter((r): r is MemberRow => r !== null).
  sort((a, b) => a.name.localeCompare(b.name));

  const columns: TableColumn<MemberRow>[] = [
  {
    key: 'employee',
    header: 'Employee',
    render: (r) =>
    <div className="flex min-w-[180px] items-center gap-3">
          <Avatar name={r.name} src={r.employee.avatar ?? undefined} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{r.name}</p>
            <p className="text-[13px] tabular-nums text-muted">{r.employee.employeeNumber}</p>
          </div>
        </div>

  },
  { key: 'position', header: 'Position', hideBelow: 'lg', render: (r) => <span className="whitespace-nowrap text-muted">{r.position?.name ?? '—'}</span> },
  {
    key: 'assigned',
    header: 'Assigned',
    hideBelow: 'sm',
    render: (r) => <span className="whitespace-nowrap tabular-nums text-muted">{formatProjectDate(r.member.assignedAt.slice(0, 10), 'MMM d, yyyy')}</span>
  },
  {
    key: 'status',
    header: 'Status',
    render: (r) =>
    <div className="flex flex-col items-start gap-1">
          <Badge tone="success" dot>
            Active
          </Badge>
          {r.employee.employmentStatus !== 'active' &&
      <span className="whitespace-nowrap text-xs text-muted">Employee {employmentStatusLabels[r.employee.employmentStatus].toLowerCase()}</span>
      }
        </div>

  },
  {
    key: 'actions',
    header: 'Actions',
    align: 'right',
    render: (r) =>
    <IconButton label={`Remove ${r.name} from project`} onClick={() => onRemove(r.member, r.name)}>
          <UserMinusIcon className="h-4 w-4" />
        </IconButton>

  }];


  return (
    <div ref={ref} id="project-members" className="scroll-mt-24">
      <Card
        title="Project Members"
        bodyClassName="p-0 pt-4"
        action={
        <Button size="sm" leftIcon={<UserPlusIcon className="h-4 w-4" />} onClick={onAdd}>
            Add Members
          </Button>
        }>
        
        <dl className="grid grid-cols-2 gap-4 px-5 pb-4">
          {[
          ['Team Members', summary.teamMembers],
          ['Active Members', summary.activeMembers]].
          map(([label, value]) =>
          <div key={label}>
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums text-ink">{value}</dd>
            </div>
          )}
        </dl>
        <div className="border-t border-line">
          {rows.length === 0 ?
          <EmptyState
            icon={UsersRoundIcon}
            title="No members yet"
            description="Add employees to build the project team."
            action={
            <Button variant="secondary" onClick={onAdd}>
                  Add Members
                </Button>
            } /> :


          <Table caption="Project members" columns={columns} rows={rows} getRowKey={(r) => r.member.id} />
          }
        </div>
      </Card>
    </div>);

});