
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReviewCard } from './ReviewCard';
import { ReviewStats } from './ReviewStats';
import { ReviewForm } from './ReviewForm';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquarePlus, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserReview } from '@/hooks/useUserReview';
import type { Tables } from '@/integrations/supabase/types';

type Review = Tables<'reviews'> & {
  profiles: Tables<'profiles'> | null;
};

interface ReviewsListProps {
  eventId: string;
}

export const ReviewsList = ({ eventId }: ReviewsListProps) => {
  const { user } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('newest');
  const queryClient = useQueryClient();

  // Check if current user has already reviewed this event
  const { hasReviewed, userReview, isLoading: isCheckingReview } = useUserReview({ eventId });

  const { data: reviews = [], isLoading, error } = useQuery({
    queryKey: ['reviews', eventId, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('reviews')
        .select(`
          *,
          profiles (*)
        `)
        .eq('event_id', eventId)
        .eq('status', 'approved'); // Only show approved reviews

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'highest':
          query = query.order('rating', { ascending: false });
          break;
        case 'lowest':
          query = query.order('rating', { ascending: true });
          break;
        case 'helpful':
          query = query.order('helpful_count', { ascending: false });
          break;
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Review[];
    },
  });

  // Real-time subscription for review responses - fixed to prevent multiple subscriptions
  useEffect(() => {
    const channelName = `review-responses-${eventId}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'review_responses',
        },
        () => {
          // Invalidate review responses queries when there are changes
          console.log('Review response updated, refreshing...');
          queryClient.invalidateQueries({ queryKey: ['reviews', eventId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, queryClient]);

  if (isLoading || isCheckingReview) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Failed to load reviews. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    // Refresh the user review check
    queryClient.invalidateQueries({ queryKey: ['user-review', eventId, user?.id] });
  };

  return (
    <div className="space-y-6">
      {/* Review Statistics */}
      <ReviewStats reviews={reviews} />

      {/* Write Review Button/Form or Already Reviewed Message */}
      {user && (
        <>
          {!hasReviewed && !showReviewForm && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Button 
                    onClick={() => setShowReviewForm(true)}
                    className="gap-2"
                  >
                    <MessageSquarePlus className="h-4 w-4" />
                    Write a Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {hasReviewed && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">You have already reviewed this event</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Thank you for sharing your feedback!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {showReviewForm && (
            <ReviewForm 
              eventId={eventId} 
              onSuccess={handleReviewSuccess}
            />
          )}
        </>
      )}

      {/* Reviews List */}
      {reviews.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Reviews ({reviews.length})
              </CardTitle>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="highest">Highest Rated</SelectItem>
                  <SelectItem value="lowest">Lowest Rated</SelectItem>
                  <SelectItem value="helpful">Most Helpful</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
