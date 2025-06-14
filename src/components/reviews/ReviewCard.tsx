
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Review = Tables<'reviews'> & {
  profiles: Tables<'profiles'> | null;
};

interface ReviewCardProps {
  review: Review;
}

interface StarDisplayProps {
  rating: number;
  label: string;
}

const StarDisplay = ({ rating, label }: StarDisplayProps) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground w-20">{label}:</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">({rating}/5)</span>
    </div>
  );
};

export const ReviewCard = ({ review }: ReviewCardProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const voteOnReview = useMutation({
    mutationFn: async ({ isHelpful }: { isHelpful: boolean }) => {
      if (!user) throw new Error('User not authenticated');

      // First, check if user has already voted
      const { data: existingVote } = await supabase
        .from('review_votes')
        .select('*')
        .eq('review_id', review.id)
        .eq('user_id', user.id)
        .single();

      if (existingVote) {
        // Update existing vote
        const { error } = await supabase
          .from('review_votes')
          .update({ is_helpful: isHelpful })
          .eq('id', existingVote.id);
        
        if (error) throw error;
      } else {
        // Create new vote
        const { error } = await supabase
          .from('review_votes')
          .insert({
            review_id: review.id,
            user_id: user.id,
            is_helpful: isHelpful,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast({
        title: 'Vote recorded',
        description: 'Thank you for your feedback!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error voting',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const createdDate = new Date(review.created_at).toLocaleDateString();
  const authorName = review.profiles?.full_name || review.profiles?.username || 'Anonymous';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold">{review.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">by {authorName}</span>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">{createdDate}</span>
                {review.verified_attendance && (
                  <Badge variant="outline" className="text-xs">
                    Verified Attendee
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          <p className="text-sm leading-relaxed">{review.content}</p>

          {(review.atmosphere_rating || review.organization_rating || review.value_rating) && (
            <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
              <h5 className="text-sm font-medium">Detailed Ratings</h5>
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
          )}

          {user && (
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => voteOnReview.mutate({ isHelpful: true })}
                  disabled={voteOnReview.isPending}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Helpful
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => voteOnReview.mutate({ isHelpful: false })}
                  disabled={voteOnReview.isPending}
                >
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  Not Helpful
                </Button>
              </div>
              {review.helpful_count > 0 && (
                <span className="text-sm text-muted-foreground">
                  {review.helpful_count} found this helpful
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
