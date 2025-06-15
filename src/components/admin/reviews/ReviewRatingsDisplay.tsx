
import React from 'react';
import { Star } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

interface ReviewRatingsDisplayProps {
  review: Tables<'reviews'>;
}

const StarDisplay = ({ rating, label }: { rating: number; label: string }) => (
  <div className="flex items-center gap-2">
    <span className="text-sm text-muted-foreground w-20">{label}:</span>
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
    <span className="text-sm text-muted-foreground">({rating}/5)</span>
  </div>
);

export const ReviewRatingsDisplay = ({ review }: ReviewRatingsDisplayProps) => {
  return (
    <div className="space-y-3">
      <h4 className="font-medium">Ratings</h4>
      <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
        <StarDisplay rating={review.rating} label="Overall" />
        {review.atmosphere_rating && (
          <StarDisplay rating={review.atmosphere_rating} label="Atmosphere" />
        )}
        {review.organization_rating && (
          <StarDisplay rating={review.organization_rating} label="Organization" />
        )}
        {review.value_rating && (
          <StarDisplay rating={review.value_rating} label="Value" />
        )}
      </div>
    </div>
  );
};
