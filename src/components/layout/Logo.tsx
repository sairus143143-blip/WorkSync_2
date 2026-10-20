import React from 'react';
import { cn } from '../../utils/cn';
import workSyncLogo from '../../assets/Untitled_design.png';
import { useSettings } from '../../contexts/SettingsContext';

interface LogoProps {
  showTagline?: boolean;
  markOnly?: boolean;
  className?: string;
}

export function LogoMark({ className }: {className?: string;}) {
  return (
    <span className={cn('relative block h-8 w-8 shrink-0 overflow-hidden rounded-full', className)}>
      <img
        src={workSyncLogo}
        alt="WorkSync"
        className="absolute left-1/2 top-1/2 h-[172%] w-[172%] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover"
      />
    </span>
  );

}

export function Logo({ showTagline = true, markOnly = false, className }: LogoProps) {
  const { settings } = useSettings();
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark />
      {!markOnly &&
      <div className="leading-tight">
          <p className="text-[15px] font-semibold tracking-tight text-ink">{settings.systemName}</p>
          {showTagline && <p className="text-[11px] text-subtle">{settings.tagline}</p>}
        </div>
      }
    </div>);

}
