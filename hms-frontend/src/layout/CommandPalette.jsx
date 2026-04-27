import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarDays,
  CreditCard,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext.jsx';
import { useTheme } from '../theme/ThemeProvider.jsx';

const PAGES = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'doctor', 'patient'] },
  { to: '/patients', label: 'Patients', icon: Users, roles: ['admin'] },
  { to: '/doctors', label: 'Doctors', icon: Stethoscope, roles: ['admin'] },
  { to: '/appointments', label: 'Appointments', icon: CalendarDays, roles: ['admin', 'doctor', 'patient'] },
  { to: '/payments', label: 'Payments', icon: CreditCard, roles: ['admin', 'patient'] },
];

export default function CommandPalette({ open, setOpen }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setOpen]);

  const go = (to) => {
    setOpen(false);
    navigate(to);
  };

  const pages = PAGES.filter((p) => !user?.role || p.roles.includes(user.role));

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-ink-950/60 backdrop-blur-sm flex items-start justify-center pt-24"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-lift overflow-hidden animate-fade-up"
      >
        <Command label="Command palette" className="text-sm">
          <Command.Input
            autoFocus
            placeholder="Type a command or search…"
            className="w-full px-4 py-3 bg-transparent border-b border-ink-200 dark:border-ink-800 outline-none placeholder:text-ink-muted"
          />
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="px-3 py-6 text-center text-ink-muted">
              No results.
            </Command.Empty>

            <Command.Group heading="Pages" className="text-xs text-ink-muted px-2 py-1">
              {pages.map(({ to, label, icon: Icon }) => (
                <Command.Item
                  key={to}
                  onSelect={() => go(to)}
                  className="flex items-center gap-3 px-2 py-2 rounded-md cursor-pointer aria-selected:bg-primary-soft dark:aria-selected:bg-primary-softDark"
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Actions" className="text-xs text-ink-muted px-2 py-1 mt-2">
              <Command.Item
                onSelect={() => {
                  setOpen(false);
                  toggle();
                }}
                className="flex items-center gap-3 px-2 py-2 rounded-md cursor-pointer aria-selected:bg-primary-soft dark:aria-selected:bg-primary-softDark"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                <span>Toggle theme</span>
              </Command.Item>
              <Command.Item
                onSelect={() => {
                  setOpen(false);
                  logout();
                }}
                className="flex items-center gap-3 px-2 py-2 rounded-md cursor-pointer aria-selected:bg-red-50 dark:aria-selected:bg-red-900/30 text-red-600 dark:text-red-400"
              >
                <LogOut size={16} />
                <span>Log out</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
