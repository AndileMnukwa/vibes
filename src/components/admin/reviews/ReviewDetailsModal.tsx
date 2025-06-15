
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { ReviewStatusBadge } from './ReviewStatusBadge';
import { SentimentIndicator } from '@/components/reviews/SentimentIndicator';
import { formatDistanceToNow } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

type ReviewWithDetails = Tables<'reviews'> & {
  profiles: Tables<'profiles'> | null;
  events: Pick<Tables<'events'>, 'id' | 'title'> | null;
};

interface ReviewDetailsModalProps {
  review: ReviewWithDetails;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (reviewId: string, status: 'approved' | 'rejected') => void;
  onRefresh: () => void;
}

export const ReviewDetailsModal = ({
  review,
  isOpen,
  onClose,
  onStatusUpdate,
}: ReviewDetailsModalProps) => {
  const authorName = review.profiles?.full_name || review.profiles?.username || 'Anonymous';
  const createdDate = formatDistanceToNow(new Date(review.created_at), { addSuffix: true });

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Review Details</span>
            <div className="flex items-center gap-2">
              <ReviewStatusBadge status={review.status} />
              {review.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStatusUpdate(review.id, 'approved')}
                    className="text-green-600 border-green-600 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStatusUpdate(review.id, 'rejected')}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="text-sm font-medium text-blue-900 mb-2">AI Summary</h5>
                <p className="text-sm text-blue-800">{review.ai_summary}</p>
              </div>
            )}

            {/* Ratings */}
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

            {/* Stats */}
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
