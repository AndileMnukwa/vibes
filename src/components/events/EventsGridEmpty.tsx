
import React from 'react';
import { motion } from 'framer-motion';

interface EventsGridEmptyProps {
  hasFilters: boolean;
}

export function EventsGridEmpty({ hasFilters }: EventsGridEmptyProps) {
  return (
    <div className="text-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold">No events found</h3>
        <p className="text-muted-foreground">
          {hasFilters 
            ? 'Try adjusting your filters or search terms.'
            : 'Be the first to create an event in your area!'
          }
        </p>
      </motion.div>
    </div>
  );
}
