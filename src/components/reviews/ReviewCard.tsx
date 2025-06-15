
import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp, ThumbsDown, Reply, MessageSquare } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { SentimentIndicator } from './SentimentIndicator';
import { ReviewResponse } from './ReviewResponse';
import { ReviewResponseForm } from './ReviewResponseForm';
import type { Tables } from '@/integrations/supabase/types';

type Review = Tables<'reviews'> & {
  profiles: Tables<'profiles'> | null;
};

type ReviewResponseWithProfile = Tables<'review_responses'> & {
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
  const { isAdmin } = useUserRole();
  const queryClient = useQueryClient();
  const [showResponseForm, setShowResponseForm] = useState(false);

  // Fetch admin responses for this review
  const { data: responses = [] } = useQuery({
    queryKey: ['review-responses', review.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('review_responses')
        .select(`
          *,
          profiles (
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('review_id', review.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ReviewResponseWithProfile[];
    },
  });

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

  const handleResponseSuccess = () => {
    setShowResponseForm(false);
  };

  return (
    <div className="space-y-0">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
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
                      <SentimentIndicator 
                        sentiment={review.sentiment as 'positive' | 'negative' | 'neutral' | null}
                        confidence={review.sentiment_confidence}
                      />
                      {responses.length > 0 && (
                        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Admin Responded
                        </Badge>
                      )}
                    </div>
                  </div>
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

            {review.ai_summary && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="text-sm font-medium text-blue-900 mb-1">AI Summary</h5>
                <p className="text-sm text-blue-800">{review.ai_summary}</p>
              </div>
            )}

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
                  {isAdmin && !showResponseForm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowResponseForm(true)}
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    >
                      <Reply className="h-4 w-4 mr-1" />
                      Respond
                    </Button>
                  )}
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

      {/* Admin Response Form */}
      {showResponseForm && isAdmin && (
        <ReviewResponseForm
          reviewId={review.id}
          onSuccess={handleResponseSuccess}
          onCancel={() => setShowResponseForm(false)}
        />
      )}

      {/* Display Admin Responses */}
      {responses.map((response) => (
        <ReviewResponse key={response.id} response={response} />
      ))}
    </div>
  );
};
