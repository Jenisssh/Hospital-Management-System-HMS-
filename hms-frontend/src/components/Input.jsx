import { forwardRef } from 'react';
import { cn } from '../lib/cn.js';

const Input = forwardRef(function Input({ label, error, className, ...props }, ref) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && (
        <span className="text-xs font-medium text-ink-700 dark:text-ink-300">{label}</span>
      )}
      <input
        ref={ref}
        className={cn(
          'h-10 w-full rounded-lg border bg-white dark:bg-ink-900 px-3 text-sm',
          'border-ink-200 dark:border-ink-700',
          'placeholder:text-ink-muted',
          'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
          error && 'border-red-400 focus:border-red-500 focus:ring-red-500/20',
          className,
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
    </label>
  );
});

export default Input;
