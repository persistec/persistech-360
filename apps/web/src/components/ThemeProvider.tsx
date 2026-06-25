'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextProps {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  // Handle system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (mode === 'system') {
        const newResolved = mediaQuery.matches ? 'dark' : 'light';
        setResolvedTheme(newResolved);
        document.documentElement.dataset.theme = newResolved;
        document.documentElement.style.colorScheme = newResolved;
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]);

  // Handle initial load and mode changes
  useEffect(() => {
    const stored = localStorage.getItem('persistech-360-theme-mode');
    
    // Normalize legacy/invalid values
    let initialMode: ThemeMode = 'system';
    if (stored) {
      const lower = stored.toLowerCase();
      if (lower === 'claro' || lower === 'light') initialMode = 'light';
      else if (lower === 'escuro' || lower === 'dark') initialMode = 'dark';
      // else it remains 'system'
    }
    
    setModeState(initialMode);
    localStorage.setItem('persistech-360-theme-mode', initialMode); // fix legacy storage immediately

    const applyTheme = (currentMode: ThemeMode) => {
      let resolved: ResolvedTheme;
      if (currentMode === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        resolved = currentMode;
      }
      setResolvedTheme(resolved);
      document.documentElement.dataset.theme = resolved;
      document.documentElement.style.colorScheme = resolved;
    };

    applyTheme(initialMode);
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem('persistech-360-theme-mode', newMode);
    
    let resolved: ResolvedTheme;
    if (newMode === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      resolved = newMode;
    }
    setResolvedTheme(resolved);
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
  };

  return (
    <ThemeContext.Provider value={{ mode, resolvedTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
