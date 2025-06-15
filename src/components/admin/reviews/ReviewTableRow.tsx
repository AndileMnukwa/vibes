
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ExternalLink } from 'lucide-react';
import { ReviewStatusBadge } from './ReviewStatusBadge';
import { SentimentIndicator } from '@/components/reviews/SentimentIndicator';
import { ReviewTableActions } from './ReviewTableActions';
import { formatDistanceToNow } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

type ReviewWithDetails = Tables<'reviews'> & {
  profiles: Tables<'profiles'> | null;
  events: Pick<Tables<'events'>, 'id' | 'title'> | null;
};

interface ReviewTableRowProps {
  review: ReviewWithDetails;
  onReviewClick: (review: ReviewWithDetails) => void;
  onAIAnalysis: (review: ReviewWithDetails) => void;
  onStatusUpdate: (reviewId: string, status: 'approved' | 'rejected') => void;
  isAnalyzing: boolean;
  isUpdatingStatus: boolean;
}

export const ReviewTableRow = ({
  review,
  onReviewClick,
  onAIAnalysis,
  onStatusUpdate,
  isAnalyzing,
  isUpdatingStatus,
}: ReviewTableRowProps) => {
  return (
    <TableRow key={review.id}>
      <TableCell>
        <div className="max-w-xs">
          <p className="font-medium truncate">{review.title}</p>
          <p className="text-sm text-muted-foreground truncate">
            {review.content.substring(0, 100)}...
          </p>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {review.profiles?.avatar_url && (
            <img
              src={review.profiles.avatar_url}
              alt="Avatar"
              className="h-8 w-8 rounded-full"
            />
          )}
          <div>
            <p className="text-sm font-medium">
              {review.profiles?.full_name || review.profiles?.username || 'Anonymous'}
            </p>
            {review.verified_attendance && (
              <Badge variant="outline" className="text-xs">
                Verified
              </Badge>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="text-sm">{review.events?.title || 'Unknown Event'}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`/events/${review.event_id}`, '_blank')}
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{review.rating}</span>
        </div>
      </TableCell>
      <TableCell>
        <ReviewStatusBadge status={review.status} />
      </TableCell>
      <TableCell>
        <SentimentIndicator
          sentiment={review.sentiment as 'positive' | 'negative' | 'neutral' | null}
          confidence={review.sentiment_confidence}
        />
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
        </span>
      </TableCell>
      <TableCell>
        <ReviewTableActions
          review={review}
          onReviewClick={onReviewClick}
          onAIAnalysis={onAIAnalysis}
          onStatusUpdate={onStatusUpdate}
          isAnalyzing={isAnalyzing}
          isUpdatingStatus={isUpdatingStatus}
        />
      </TableCell>
    </TableRow>
  );
};
