
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ReviewStatusBadgeProps {
  status: string | null;
}

export const ReviewStatusBadge = ({ status }: ReviewStatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
        return {
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200',
          label: 'Approved',
        };
      case 'rejected':
        return {
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200',
          label: 'Rejected',
        };
      case 'pending':
        return {
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          label: 'Pending',
        };
      default:
        return {
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          label: 'Unknown',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};
