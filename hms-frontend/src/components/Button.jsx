import { cn } from '../lib/cn.js';

const variants = {
  primary:
    'bg-primary-600 hover:bg-primary-700 text-white border-transparent shadow-soft hover:shadow-glow disabled:bg-primary-400',
  secondary:
    'bg-white dark:bg-ink-800 text-ink-900 dark:text-ink-100 border-ink-200 dark:border-ink-700 hover:border-ink-300 dark:hover:border-ink-600 hover:bg-ink-50 dark:hover:bg-ink-700',
  ghost:
    'bg-transparent text-ink-700 dark:text-ink-300 border-transparent hover:bg-ink-100 dark:hover:bg-ink-800',
  danger:
    'bg-red-600 hover:bg-red-700 text-white border-transparent shadow-soft disabled:bg-red-400',
  gradient:
    'bg-aurora text-white border-transparent shadow-glow hover:shadow-glow-strong',
};

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'h-9 w-9 p-0',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition-all',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-ink-900',
        'active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
