import * as React from 'react';
import { getUserPreferences } from '@/app/actions/preferences';
import { PreferencesProvider, type UserPreferences } from './PreferencesProvider';

export async function LayoutWithPreferences({
  children
}: {
  children: React.ReactNode;
}) {
  // Fetch user preferences server-side
  const result = await getUserPreferences();
  
  const initialPreferences: UserPreferences = result.success && result.data
    ? result.data
    : {
        language: 'en',
        fontSize: 'medium',
        theme: 'light'
      };

  return (
    <PreferencesProvider initialPreferences={initialPreferences}>
      {children}
    </PreferencesProvider>
  );
}
