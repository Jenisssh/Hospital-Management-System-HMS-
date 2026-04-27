import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../lib/cn.js';

export default function Modal({ open, onOpenChange, title, description, children, footer, size = 'md' }) {
  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }[size];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink-950/60 backdrop-blur-sm data-[state=open]:animate-fade-up" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 p-4',
            sizeClass,
          )}
        >
          <div className="rounded-xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-lift animate-fade-up">
            <div className="flex items-start justify-between gap-4 border-b border-ink-200 dark:border-ink-800 p-5">
              <div>
                <Dialog.Title className="text-base font-semibold">{title}</Dialog.Title>
                {description && (
                  <Dialog.Description className="text-sm text-ink-muted mt-0.5">
                    {description}
                  </Dialog.Description>
                )}
              </div>
              <Dialog.Close className="rounded-md p-1 hover:bg-ink-100 dark:hover:bg-ink-800">
                <X size={18} />
              </Dialog.Close>
            </div>
            <div className="p-5">{children}</div>
            {footer && (
              <div className="flex items-center justify-end gap-2 border-t border-ink-200 dark:border-ink-800 p-4 bg-ink-50/50 dark:bg-ink-950/50 rounded-b-xl">
                {footer}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
