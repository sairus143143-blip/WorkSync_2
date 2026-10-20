import React from 'react';
import { ModulePlaceholder } from '../components/layout/ModulePlaceholder';
import { modules } from '../data/modules';

export function Profile() {
  return <ModulePlaceholder module={modules.profile} />;
}