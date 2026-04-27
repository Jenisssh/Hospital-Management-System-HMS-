import { cn } from '../lib/cn.js';

export default function Skeleton({ className }) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-md bg-gradient-to-r from-ink-100 via-ink-200 to-ink-100 dark:from-ink-800 dark:via-ink-700 dark:to-ink-800',
        'bg-[length:200%_100%]',
        className,
      )}
    />
  );
}
