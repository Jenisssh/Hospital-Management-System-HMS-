import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarDays,
  CreditCard,
  Plus,
  LogOut,
} from 'lucide-react';
import { cn } from '../lib/cn.js';
import { useAuth } from '../auth/AuthContext.jsx';
import Avatar from '../components/Avatar.jsx';
import { RoleBadge } from '../components/StatusBadge.jsx';

const ALL_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'doctor', 'patient'] },
  { to: '/patients', label: 'Patients', icon: Users, roles: ['admin'] },
  { to: '/doctors', label: 'Doctors', icon: Stethoscope, roles: ['admin'] },
  { to: '/appointments', label: 'Appointments', icon: CalendarDays, roles: ['admin', 'doctor', 'patient'] },
  { to: '/payments', label: 'Payments', icon: CreditCard, roles: ['admin', 'patient'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const items = ALL_ITEMS.filter((it) => !user?.role || it.roles.includes(user.role));

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-ink-200 dark:border-ink-800">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-aurora text-white shadow-glow">
          <Plus size={18} strokeWidth={2.5} />
        </span>
        <div className="leading-tight">
          <div className="font-bold tracking-tight">HMS</div>
          <div className="text-[11px] text-ink-muted">Hospital management</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors relative',
                isActive
                  ? 'bg-primary-soft dark:bg-primary-softDark text-primary-700 dark:text-primary-300'
                  : 'text-ink-700 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-aurora" />
                )}
                <Icon size={18} className="shrink-0" />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User card */}
      <div className="border-t border-ink-200 dark:border-ink-800 p-3">
        <div className="flex items-center gap-3 rounded-lg p-2">
          <Avatar name={user?.username} size={36} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.username}</div>
            <RoleBadge role={user?.role} />
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="rounded-md p-1.5 text-ink-muted hover:bg-ink-100 dark:hover:bg-ink-800 hover:text-red-600"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
