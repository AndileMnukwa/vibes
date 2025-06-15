
import React from 'react';
import type { Tables } from '@/integrations/supabase/types';

interface ReviewStatsDisplayProps {
  review: Tables<'reviews'>;
}

export const ReviewStatsDisplay = ({ review }: ReviewStatsDisplayProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
      <div>
        <p className="text-sm font-medium">Helpful Votes</p>
        <p className="text-lg font-bold">{review.helpful_count || 0}</p>
      </div>
      <div>
        <p className="text-sm font-medium">Sentiment Score</p>
        <p className="text-lg font-bold">
          {review.sentiment_confidence 
            ? `${Math.round(review.sentiment_confidence * 100)}%`
            : 'N/A'
          }
        </p>
      </div>
    </div>
  );
};
