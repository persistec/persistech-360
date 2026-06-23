'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';
import { FiMonitor, FiSun, FiMoon } from 'react-icons/fi';

export function ThemeSwitcher() {
  const { mode, setMode } = useTheme();

  return (
    <div className="flex flex-col gap-1">
      <label className="sr-only">Aparência</label>
      <div className="flex w-full rounded-md border border-border bg-surface-muted p-1">
        <button
          type="button"
          aria-pressed={mode === 'system'}
          onClick={() => setMode('system')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-sm px-3 py-1.5 text-xs font-medium transition-all ${
            mode === 'system'
              ? 'bg-surface text-foreground shadow-sm ring-1 ring-border-strong'
              : 'text-muted-foreground hover:bg-surface-elevated hover:text-foreground'
          }`}
        >
          <FiMonitor className="h-3.5 w-3.5" aria-hidden="true" /> Automático
        </button>
        <button
          type="button"
          aria-pressed={mode === 'light'}
          onClick={() => setMode('light')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-sm px-3 py-1.5 text-xs font-medium transition-all ${
            mode === 'light'
              ? 'bg-surface text-foreground shadow-sm ring-1 ring-border-strong'
              : 'text-muted-foreground hover:bg-surface-elevated hover:text-foreground'
          }`}
        >
          <FiSun className="h-3.5 w-3.5" aria-hidden="true" /> Claro
        </button>
        <button
          type="button"
          aria-pressed={mode === 'dark'}
          onClick={() => setMode('dark')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-sm px-3 py-1.5 text-xs font-medium transition-all ${
            mode === 'dark'
              ? 'bg-surface text-foreground shadow-sm ring-1 ring-border-strong'
              : 'text-muted-foreground hover:bg-surface-elevated hover:text-foreground'
          }`}
        >
          <FiMoon className="h-3.5 w-3.5" aria-hidden="true" /> Escuro
        </button>
      </div>
    </div>
  );
}
