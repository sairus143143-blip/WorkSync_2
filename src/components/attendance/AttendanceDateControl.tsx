import React from 'react';
import { addDays, format, parseISO } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface AttendanceDateControlProps {
  value: string;
  today: string;
  onChange: (date: string) => void;
}

function shift(date: string, days: number) {
  return format(addDays(parseISO(date), days), 'yyyy-MM-dd');
}

/** Previous / Today / Next with a date picker. Dates after the prototype's "today" are disabled. */
export function AttendanceDateControl({ value, today, onChange }: AttendanceDateControlProps) {
  const isToday = value === today;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center rounded-lg border border-line bg-surface">
        <Button variant="ghost" size="icon" aria-label="Previous day" className="rounded-r-none" onClick={() => onChange(shift(value, -1))}>
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 rounded-none border-x border-line"
          onClick={() => onChange(today)}
          disabled={isToday}
          aria-pressed={isToday}>
          
          Today
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Next day"
          className="rounded-l-none"
          onClick={() => onChange(shift(value, 1))}
          disabled={value >= today}>
          
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
      <Input
        type="date"
        label="Attendance date"
        hideLabel
        value={value}
        max={today}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        className="w-40" />
      
      <p className="text-[13px] text-muted">{format(parseISO(value), 'EEEE, MMMM d, yyyy')}</p>
    </div>);

}