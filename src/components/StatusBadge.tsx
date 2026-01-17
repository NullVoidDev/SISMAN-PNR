import { RequestStatus, STATUS_LABELS } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'status-badge',
        {
          'status-pending': status === 'pendente',
          'status-approved': status === 'aprovado',
          'status-denied': status === 'negado',
        },
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
