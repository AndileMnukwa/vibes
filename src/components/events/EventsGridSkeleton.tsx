
import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type ViewMode = 'grid' | 'list';

interface EventsGridSkeletonProps {
  viewMode: ViewMode;
}

export function EventsGridSkeleton({ viewMode }: EventsGridSkeletonProps) {
  return (
    <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="h-80">
          <Skeleton className="h-full w-full" />
        </Card>
      ))}
    </div>
  );
}
