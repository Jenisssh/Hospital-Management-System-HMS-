import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes intelligently — later classes override conflicting earlier ones. */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
