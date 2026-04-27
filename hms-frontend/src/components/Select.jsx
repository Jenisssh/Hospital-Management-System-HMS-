import { forwardRef } from 'react';
import { cn } from '../lib/cn.js';

const Select = forwardRef(function Select(
  { label, error, className, children, ...props },
  ref,
) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && (
        <span className="text-xs font-medium text-ink-700 dark:text-ink-300">{label}</span>
      )}
      <select
        ref={ref}
        className={cn(
          'h-10 w-full rounded-lg border bg-white dark:bg-ink-900 px-3 text-sm',
          'border-ink-200 dark:border-ink-700',
          'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
    </label>
  );
});

export default Select;
