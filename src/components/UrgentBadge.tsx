import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UrgentBadgeProps {
  className?: string;
}

export function UrgentBadge({ className }: UrgentBadgeProps) {
  return (
    <span className={cn('urgent-badge status-badge flex items-center gap-1', className)}>
      <AlertTriangle className="w-3 h-3" />
      URGENTE
    </span>
  );
}
