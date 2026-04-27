import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sun, Moon, Search, Command } from 'lucide-react';
import { useTheme } from '../theme/ThemeProvider.jsx';
import Button from '../components/Button.jsx';

const TITLES = {
  '/': 'Dashboard',
  '/patients': 'Patients',
  '/doctors': 'Doctors',
  '/appointments': 'Appointments',
  '/payments': 'Payments',
};

export default function Topbar({ onOpenCommand }) {
  const { theme, toggle } = useTheme();
  const { pathname } = useLocation();
  const title = TITLES[pathname] || '';
  const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-ink-200 dark:border-ink-800 bg-white/80 dark:bg-ink-900/80 backdrop-blur-md px-6">
      <h1 className="text-base font-semibold tracking-tight">{title}</h1>

      <div className="flex-1" />

      <button
        onClick={onOpenCommand}
        className="hidden md:inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800/50 text-sm text-ink-muted hover:border-ink-300 dark:hover:border-ink-600 transition-colors"
      >
        <Search size={14} />
        <span>Quick search…</span>
        <kbd className="ml-2 inline-flex items-center gap-0.5 rounded border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-1.5 text-[10px] font-mono">
          {isMac ? <Command size={10} /> : 'Ctrl'}
          <span>K</span>
        </kbd>
      </button>

      <Button variant="ghost" size="icon" onClick={toggle} title="Toggle theme">
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </Button>
    </header>
  );
}
