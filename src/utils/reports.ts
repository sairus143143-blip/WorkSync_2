import { endOfMonth, endOfWeek, endOfYear, format, isValid, parseISO, startOfMonth, startOfWeek, startOfYear } from 'date-fns';

export type ReportPeriod = 'today' | 'week' | 'month' | 'year' | 'custom';

export function reportDateRange(period: ReportPeriod, today: string, customFrom: string, customTo: string) {
  const anchor = parseISO(today);
  if (!isValid(anchor)) return { from: '', to: '' };
  if (period === 'custom') return { from: customFrom, to: customTo };
  if (period === 'today') return { from: today, to: today };
  if (period === 'week') return { from: format(startOfWeek(anchor, { weekStartsOn: 1 }), 'yyyy-MM-dd'), to: format(endOfWeek(anchor, { weekStartsOn: 1 }) > anchor ? anchor : endOfWeek(anchor, { weekStartsOn: 1 }), 'yyyy-MM-dd') };
  if (period === 'month') return { from: format(startOfMonth(anchor), 'yyyy-MM-dd'), to: format(endOfMonth(anchor) > anchor ? anchor : endOfMonth(anchor), 'yyyy-MM-dd') };
  return { from: format(startOfYear(anchor), 'yyyy-MM-dd'), to: format(endOfYear(anchor) > anchor ? anchor : endOfYear(anchor), 'yyyy-MM-dd') };
}

export function isValidReportDate(value: string): boolean {
  return Boolean(value) && isValid(parseISO(value)) && format(parseISO(value), 'yyyy-MM-dd') === value;
}

export function csvCell(value: unknown): string {
  const text = value == null ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function downloadCsv(filename: string, headings: string[], rows: unknown[][]): boolean {
  if (rows.length === 0 || typeof document === 'undefined' || typeof URL.createObjectURL !== 'function') return false;
  const csv = [headings, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  return true;
}
