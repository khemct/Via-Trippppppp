import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

const COLOR_THEMES = ['adventure', 'bright', 'modern', 'vintage'];

function getInitialTheme() {
  const stored = localStorage.getItem('viattrip_theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialColorTheme() {
  const stored = localStorage.getItem('viattrip_color_theme');
  if (COLOR_THEMES.includes(stored)) return stored;
  return 'vintage';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);
  const [colorTheme, setColorTheme] = useState(getInitialColorTheme);

  useEffect(() => {
    const root = document.documentElement;
    COLOR_THEMES.forEach((t) => root.classList.toggle(`theme-${t}`, t === colorTheme));
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('viattrip_theme', theme);
    localStorage.setItem('viattrip_color_theme', colorTheme);
  }, [theme, colorTheme]);

  const toggle = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const cycleColorTheme = useCallback(() => {
    setColorTheme((prev) => {
      const idx = COLOR_THEMES.indexOf(prev);
      return COLOR_THEMES[(idx + 1) % COLOR_THEMES.length];
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle, colorTheme, cycleColorTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
