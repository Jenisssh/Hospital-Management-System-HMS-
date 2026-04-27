import { cn } from '../lib/cn.js';

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      {Icon && (
        <div className="mb-4 rounded-2xl bg-primary-soft dark:bg-primary-softDark p-4">
          <Icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-ink-muted max-w-md">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
