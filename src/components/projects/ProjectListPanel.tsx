import React, { useCallback, useEffect, useState } from 'react';
import { FolderOpenIcon, SearchXIcon, SlidersHorizontalIcon } from 'lucide-react';
import type { DeadlineFilter, ProgressFilter, ProjectRow, ProjectSortKey, ProjectStatusFilter } from '../../types/projects';
import { useTableDirectory } from '../../hooks/useTableDirectory';
import { cn } from '../../utils/cn';
import { PROJECT_STATUSES, matchesProgress, progressFilterLabels, projectStatusLabels } from '../../utils/projects';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { Pagination } from '../ui/Pagination';
import { SearchInput } from '../ui/SearchInput';
import { Select } from '../ui/Select';
import { ProjectTable } from './ProjectTable';

const PAGE_SIZE = 10;
const statusOrder = Object.fromEntries(PROJECT_STATUSES.map((s, i) => [s, i]));

interface ProjectListPanelProps {
  rows: ProjectRow[];
  leadName: (createdBy: string) => string;
  onCreate: () => void;
  onView: (row: ProjectRow) => void;
  onEdit: (row: ProjectRow) => void;
  onManageMembers: (row: ProjectRow) => void;
  onChangeStatus: (row: ProjectRow) => void;
}

function compareRows(a: ProjectRow, b: ProjectRow, key: ProjectSortKey): number {
  switch (key) {
    case 'name':
      return a.project.name.localeCompare(b.project.name);
    case 'code':
      return a.project.code.localeCompare(b.project.code, undefined, { numeric: true });
    case 'startDate':
      return a.project.startDate.localeCompare(b.project.startDate);
    case 'deadline':
      return a.project.deadline.localeCompare(b.project.deadline);
    case 'progress':
      return a.project.progress - b.project.progress;
    case 'status':
      return statusOrder[a.project.status] - statusOrder[b.project.status] || a.project.name.localeCompare(b.project.name);
    case 'members':
      return a.memberCount - b.memberCount;
  }
}

const searchText = (r: ProjectRow) => `${r.project.name} ${r.project.code} ${r.project.description}`;

export function ProjectListPanel({ rows, leadName, onCreate, onView, onEdit, onManageMembers, onChangeStatus }: ProjectListPanelProps) {
  const [status, setStatus] = useState<ProjectStatusFilter>('all');
  const [deadline, setDeadline] = useState<DeadlineFilter>('all');
  const [progress, setProgress] = useState<ProgressFilter>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  const matches = useCallback(
    (r: ProjectRow) =>
    (status === 'all' || r.project.status === status) &&
    (deadline === 'all' || r.deadlineState === deadline) &&
    matchesProgress(r.project.progress, progress),
    [status, deadline, progress]
  );
  const directory = useTableDirectory<ProjectRow, ProjectSortKey>({
    rows,
    searchText,
    matches,
    compare: compareRows,
    initialSort: { key: 'deadline', direction: 'asc' },
    descFirst: ['progress', 'members']
  });

  // Return to the first page whenever the result set changes shape.
  useEffect(() => setPage(1), [directory.query, status, deadline, progress, directory.sort]);
  const pageCount = Math.max(1, Math.ceil(directory.visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = directory.visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const activeFilterCount = [status !== 'all', deadline !== 'all', progress !== 'all'].filter(Boolean).length;
  const hasFilters = activeFilterCount > 0 || directory.query.trim() !== '';
  const clearFilters = () => {
    directory.setQuery('');
    setStatus('all');
    setDeadline('all');
    setProgress('all');
  };

  return (
    <Card bodyClassName="p-0">
      <div className="space-y-3 border-b border-line p-4">
        <div className="flex items-center gap-2">
          <SearchInput value={directory.query} onChange={directory.setQuery} label="Search projects" placeholder="Search projects..." className="lg:max-w-sm" />
          <Button
            variant="secondary"
            className="sm:hidden"
            aria-expanded={filtersOpen}
            aria-controls="project-filters"
            onClick={() => setFiltersOpen((v) => !v)}
            leftIcon={<SlidersHorizontalIcon className="h-4 w-4" />}>
            
            Filters{activeFilterCount > 0 && <span className="tabular-nums text-primary">{activeFilterCount}</span>}
          </Button>
        </div>
        <div id="project-filters" className={cn('grid-cols-1 gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:flex xl:items-center', filtersOpen ? 'grid' : 'hidden')}>
          <Select
            hideLabel
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatusFilter)}
            className="xl:w-40"
            options={[{ value: 'all', label: 'All Status' }, ...PROJECT_STATUSES.map((s) => ({ value: s, label: projectStatusLabels[s] }))]} />
          
          <Select
            hideLabel
            label="Deadline"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value as DeadlineFilter)}
            className="xl:w-40"
            options={[
            { value: 'all', label: 'All Deadlines' },
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'due_soon', label: 'Due Soon' },
            { value: 'overdue', label: 'Overdue' },
            { value: 'completed', label: 'Completed' }]
            } />
          
          <Select
            hideLabel
            label="Progress"
            value={progress}
            onChange={(e) => setProgress(e.target.value as ProgressFilter)}
            className="xl:w-36"
            options={(Object.keys(progressFilterLabels) as ProgressFilter[]).map((k) => ({ value: k, label: progressFilterLabels[k] }))} />
          
          <Button variant="ghost" size="sm" onClick={clearFilters} disabled={!hasFilters} className="justify-self-start xl:ml-auto">
            Clear Filters
          </Button>
        </div>
      </div>

      {rows.length === 0 ?
      <EmptyState
        icon={FolderOpenIcon}
        title="No projects found"
        description="Create your first project to begin tracking work and deadlines."
        action={<Button onClick={onCreate}>Create Project</Button>}
        className="py-16" /> :

      directory.visible.length === 0 ?
      <EmptyState
        icon={SearchXIcon}
        title="No matching projects"
        description="Try adjusting your search or filters."
        action={
        <Button variant="secondary" onClick={clearFilters}>
              Clear Filters
            </Button>
        }
        className="py-16" /> :


      <>
          <ProjectTable
          rows={pageRows}
          leadName={leadName}
          sort={directory.sort}
          onSort={directory.toggleSort}
          onView={onView}
          onEdit={onEdit}
          onManageMembers={onManageMembers}
          onChangeStatus={onChangeStatus} />
        
          <Pagination page={currentPage} pageSize={PAGE_SIZE} total={directory.visible.length} noun="projects" onPageChange={setPage} />
        </>
      }
    </Card>);

}