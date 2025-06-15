
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Eye, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ReviewStatusBadge } from './ReviewStatusBadge';
import { SentimentIndicator } from '@/components/reviews/SentimentIndicator';
import { formatDistanceToNow } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

type ReviewWithDetails = Tables<'reviews'> & {
  profiles: Tables<'profiles'> | null;
  events: Pick<Tables<'events'>, 'id' | 'title'> | null;
};

interface AdminReviewsTableProps {
  reviews: ReviewWithDetails[];
  onRefresh: () => void;
  onReviewSelect?: (review: ReviewWithDetails) => void;
}

export const AdminReviewsTable = ({ reviews, onRefresh, onReviewSelect }: AdminReviewsTableProps) => {
  const queryClient = useQueryClient();

  const updateReviewStatus = useMutation({
    mutationFn: async ({ reviewId, status }: { reviewId: string; status: 'approved' | 'rejected' }) => {
      const { error } = await supabase
        .from('reviews')
        .update({ status })
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast({
        title: 'Review status updated',
        description: 'The review status has been successfully updated.',
      });
      onRefresh();
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating review',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleStatusUpdate = (reviewId: string, status: 'approved' | 'rejected') => {
    updateReviewStatus.mutate({ reviewId, status });
  };

  const handleReviewClick = (review: ReviewWithDetails) => {
    if (onReviewSelect) {
      onReviewSelect(review);
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No reviews found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Review</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Event</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sentiment</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((review) => (
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
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReviewClick(review)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {review.status === 'pending' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusUpdate(review.id, 'approved')}
                        disabled={updateReviewStatus.isPending}
                      >
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusUpdate(review.id, 'rejected')}
                        disabled={updateReviewStatus.isPending}
                      >
                        <XCircle className="h-4 w-4 text-red-600" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
