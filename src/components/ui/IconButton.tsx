import React from 'react';
import { Button } from './Button';

interface IconButtonProps {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}

/** Compact, labelled icon action for table rows. */
export function IconButton({ label, onClick, children }: IconButtonProps) {
  return (
    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={label} title={label} onClick={onClick}>
      {children}
    </Button>);

}