
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Star, CheckCircle, XCircle, ExternalLink, Brain, MessageSquare, Send } from 'lucide-react';
import { ReviewStatusBadge } from './ReviewStatusBadge';
import { SentimentIndicator } from '@/components/reviews/SentimentIndicator';
import { formatDistanceToNow } from 'date-fns';
import { useSentimentAnalysis } from '@/hooks/useSentimentAnalysis';
import { toast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type ReviewWithDetails = Tables<'reviews'> & {
  profiles: Tables<'profiles'> | null;
  events: Pick<Tables<'events'>, 'id' | 'title'> | null;
};

type ReviewResponse = Tables<'review_responses'> & {
  profiles: Tables<'profiles'> | null;
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
  onRefresh,
}: ReviewDetailsModalProps) => {
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseContent, setResponseContent] = useState('');
  const queryClient = useQueryClient();
  const sentimentAnalysis = useSentimentAnalysis();

  const authorName = review.profiles?.full_name || review.profiles?.username || 'Anonymous';
  const createdDate = formatDistanceToNow(new Date(review.created_at), { addSuffix: true });

  // Fetch existing responses for this review
  const { data: responses = [] } = useQuery({
    queryKey: ['review-responses', review.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('review_responses')
        .select(`
          *,
          profiles (*)
        `)
        .eq('review_id', review.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ReviewResponse[];
    },
    enabled: isOpen,
  });

  const submitResponse = useMutation({
    mutationFn: async () => {
      if (!responseContent.trim()) {
        throw new Error('Please enter a response');
      }

      const { data, error } = await supabase
        .from('review_responses')
        .insert({
          review_id: review.id,
          admin_user_id: (await supabase.auth.getUser()).data.user?.id!,
          response_content: responseContent.trim(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-responses', review.id] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast({
        title: 'Response submitted',
        description: 'Your response has been posted successfully.',
      });
      setResponseContent('');
      setShowResponseForm(false);
      onRefresh();
    },
    onError: (error: any) => {
      toast({
        title: 'Error submitting response',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleAIAnalysis = async () => {
    try {
      await sentimentAnalysis.mutateAsync({
        reviewId: review.id,
        title: review.title,
        content: review.content,
      });
      toast({
        title: 'AI Analysis Complete',
        description: 'Sentiment analysis and summary have been generated.',
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'AI Analysis Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

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
              <Button
                variant="outline"
                size="sm"
                onClick={handleAIAnalysis}
                disabled={sentimentAnalysis.isPending}
                className="text-purple-600 border-purple-600 hover:bg-purple-50"
              >
                <Brain className="h-4 w-4 mr-1" />
                {sentimentAnalysis.isPending ? 'Analyzing...' : 'AI Analysis'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResponseForm(!showResponseForm)}
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Respond
              </Button>
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
          {/* Admin Response Form */}
          {showResponseForm && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-3">Admin Response</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="response">Your Response</Label>
                  <Textarea
                    id="response"
                    value={responseContent}
                    onChange={(e) => setResponseContent(e.target.value)}
                    placeholder="Write your response to this review..."
                    rows={4}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowResponseForm(false);
                      setResponseContent('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => submitResponse.mutate()}
                    disabled={submitResponse.isPending || !responseContent.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {submitResponse.isPending ? (
                      'Posting...'
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Post Response
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

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

            {/* Admin Responses */}
            {responses.length > 0 && (
              <div className="space-y-3">
                <Separator />
                <h4 className="font-medium">Admin Responses</h4>
                <div className="space-y-3">
                  {responses.map((response) => (
                    <div key={response.id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          Admin Response
                        </Badge>
                        <span className="text-sm font-medium">
                          {response.profiles?.full_name || response.profiles?.username || 'Admin'}
                        </span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(response.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{response.response_content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
