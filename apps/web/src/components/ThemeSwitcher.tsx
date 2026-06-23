'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';
import { Select } from '@/components/ui';

export function ThemeSwitcher() {
  const { mode, setMode } = useTheme();

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="theme-switcher" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Aparência
      </label>
      <Select 
        id="theme-switcher"
        value={mode} 
        onChange={(e) => setMode(e.target.value as 'light' | 'dark' | 'system')}
        className="h-8 py-1 text-xs"
      >
        <option value="light">Claro</option>
        <option value="dark">Escuro</option>
        <option value="system">Automático</option>
      </Select>
    </div>
  );
}
