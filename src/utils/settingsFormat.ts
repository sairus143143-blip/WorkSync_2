import { format, parseISO } from 'date-fns';
import { defaultSettings, parseSettings, SETTINGS_STORAGE_KEY } from '../data/settings';
import type { DateFormat } from '../types/settings';

function currentFormatting() {
  try { return parseSettings(localStorage.getItem(SETTINGS_STORAGE_KEY)); } catch { return defaultSettings; }
}

export function formatConfiguredDate(value: string, fallback: DateFormat = defaultSettings.dateFormat): string {
  const settings = currentFormatting();
  try { return format(parseISO(value), settings.dateFormat || fallback); } catch { return value; }
}

export function formatConfiguredTime(value: string): string {
  const settings = currentFormatting();
  try { return format(parseISO(`2000-01-01T${value}`), settings.timeFormat === '24h' ? 'HH:mm' : 'hh:mm a'); } catch { return value; }
}

export function formatConfiguredDateTime(value: string): string {
  const settings = currentFormatting();
  try { return format(parseISO(value), `${settings.dateFormat} ${settings.timeFormat === '24h' ? 'HH:mm' : 'hh:mm a'}`); } catch { return value; }
}
