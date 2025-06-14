
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSimilarEvents } from '@/hooks/useRecommendations';
import { EnhancedEventCard } from '@/components/events/EnhancedEventCard';
import { Users } from 'lucide-react';

interface SimilarEventsSectionProps {
  eventId: string;
  limit?: number;
}

export function SimilarEventsSection({ eventId, limit = 4 }: SimilarEventsSectionProps) {
  const { data: similarEvents, isLoading, error } = useSimilarEvents(eventId, limit);

  if (error) {
    console.error('Error loading similar events:', error);
    return null;
  }

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <Card key={i} className="h-64">
              <Skeleton className="h-full w-full" />
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (!similarEvents || similarEvents.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-semibold">Similar Events</h2>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
      >
        {similarEvents.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <EnhancedEventCard
              event={event}
              isExternal={false}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
