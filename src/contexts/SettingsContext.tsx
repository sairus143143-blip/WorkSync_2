import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { defaultSettings, parseSettings, SETTINGS_STORAGE_KEY } from '../data/settings';
import type { WorkSyncSettings } from '../types/settings';

interface SettingsContextValue { settings: WorkSyncSettings; saveSettings: (next: WorkSyncSettings) => boolean; resetSettings: () => boolean; }
const SettingsContext = createContext<SettingsContextValue | null>(null);

function loadSettings(): WorkSyncSettings {
  try { return parseSettings(localStorage.getItem(SETTINGS_STORAGE_KEY)); } catch { return defaultSettings; }
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<WorkSyncSettings>(loadSettings);
  const saveSettings = useCallback((next: WorkSyncSettings) => {
    try { localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next)); setSettings(next); return true; } catch { return false; }
  }, []);
  const resetSettings = useCallback(() => {
    try { localStorage.removeItem(SETTINGS_STORAGE_KEY); setSettings(defaultSettings); return true; } catch { return false; }
  }, []);
  const value = useMemo(() => ({ settings, saveSettings, resetSettings }), [settings, saveSettings, resetSettings]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used inside SettingsProvider');
  return context;
}
