import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export default function Drawer({ open, onOpenChange, title, children, footer }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink-950/60 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-2xl flex flex-col"
        >
          <div className="flex items-center justify-between gap-4 border-b border-ink-200 dark:border-ink-800 p-5">
            <Dialog.Title className="text-base font-semibold">{title}</Dialog.Title>
            <Dialog.Close className="rounded-md p-1 hover:bg-ink-100 dark:hover:bg-ink-800">
              <X size={18} />
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto p-5">{children}</div>
          {footer && (
            <div className="flex items-center justify-end gap-2 border-t border-ink-200 dark:border-ink-800 p-4">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
