'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';
import { FiMonitor, FiSun, FiMoon } from 'react-icons/fi';

export function ThemeSwitcher() {
  const { mode, setMode } = useTheme();

  const options = [
    { value: "system", label: "Automático", icon: FiMonitor },
    { value: "light", label: "Claro", icon: FiSun },
    { value: "dark", label: "Escuro", icon: FiMoon },
  ] as const;

  return (
    <div className="flex flex-col gap-1">
      <label className="sr-only">Aparência</label>
      <div className="flex w-full rounded-md border border-border bg-surface-muted p-1">
        {options.map((option) => {
          const Icon = option.icon;
          const isActive = mode === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => setMode(option.value)}
              className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-sm px-3 py-2 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                isActive
                  ? 'bg-surface text-foreground shadow-sm ring-1 ring-border-strong'
                  : 'text-muted-foreground hover:bg-surface-elevated hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}