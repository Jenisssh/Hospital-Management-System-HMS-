import { cn } from '../lib/cn.js';

const variants = {
  default: 'bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-300',
  primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
  accent: 'bg-accent-50 text-accent-600 dark:bg-accent-500/20 dark:text-accent-400',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

export default function Badge({ variant = 'default', className, children, dot = false }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full animate-pulse-dot',
            variant === 'success' && 'bg-emerald-500',
            variant === 'warning' && 'bg-amber-500',
            variant === 'danger' && 'bg-red-500',
            variant === 'primary' && 'bg-primary-500',
            variant === 'accent' && 'bg-accent-500',
            variant === 'default' && 'bg-ink-500',
          )}
        />
      )}
      {children}
    </span>
  );
}
