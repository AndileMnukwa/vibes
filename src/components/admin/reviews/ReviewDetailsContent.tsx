
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { SentimentIndicator } from '@/components/reviews/SentimentIndicator';
import { formatDistanceToNow } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

type ReviewWithDetails = Tables<'reviews'> & {
  profiles: Tables<'profiles'> | null;
  events: Pick<Tables<'events'>, 'id' | 'title'> | null;
};

interface ReviewDetailsContentProps {
  review: ReviewWithDetails;
}

export const ReviewDetailsContent = ({ review }: ReviewDetailsContentProps) => {
  const authorName = review.profiles?.full_name || review.profiles?.username || 'Anonymous';
  const createdDate = formatDistanceToNow(new Date(review.created_at), { addSuffix: true });

  return (
    <>
      {/* Review Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2">{review.title}</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              {review.profiles?.avatar_url && (
                <img
                  src={review.profiles.avatar_url}
                  alt="Avatar"
                  className="h-6 w-6 rounded-full"
                />
              )}
              <span>by {authorName}</span>
            </div>
            <span>•</span>
            <span>{createdDate}</span>
            {review.verified_attendance && (
              <>
                <span>•</span>
                <Badge variant="outline" className="text-xs">
                  Verified Attendee
                </Badge>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SentimentIndicator
            sentiment={review.sentiment as 'positive' | 'negative' | 'neutral' | null}
            confidence={review.sentiment_confidence}
            size="md"
          />
        </div>
      </div>

      {/* Event Info */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Event</h4>
            <p className="text-sm text-muted-foreground">
              {review.events?.title || 'Unknown Event'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/events/${review.event_id}`, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            View Event
          </Button>
        </div>
      </div>

      {/* Review Content */}
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Review Content</h4>
          <p className="text-sm leading-relaxed bg-muted/30 p-4 rounded-lg">
            {review.content}
          </p>
        </div>

        {/* AI Summary */}
        {review.ai_summary && (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h5 className="text-sm font-medium text-purple-900 mb-2">AI Summary</h5>
            <p className="text-sm text-purple-800">{review.ai_summary}</p>
          </div>
        )}
      </div>
    </>
  );
};
