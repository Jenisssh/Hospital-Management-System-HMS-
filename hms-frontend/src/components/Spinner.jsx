import { Loader2 } from 'lucide-react';
import { cn } from '../lib/cn.js';

export default function Spinner({ className, size = 16 }) {
  return <Loader2 className={cn('animate-spin', className)} size={size} />;
}
