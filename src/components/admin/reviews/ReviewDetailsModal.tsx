
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog';
import { useSentimentAnalysis } from '@/hooks/useSentimentAnalysis';
import { toast } from '@/hooks/use-toast';
import { ReviewDetailsHeader } from './ReviewDetailsHeader';
import { AdminResponseForm } from './AdminResponseForm';
import { ReviewDetailsContent } from './ReviewDetailsContent';
import { ReviewRatingsDisplay } from './ReviewRatingsDisplay';
import { ReviewStatsDisplay } from './ReviewStatsDisplay';
import { ReviewResponsesList } from './ReviewResponsesList';
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
  const queryClient = useQueryClient();
  const sentimentAnalysis = useSentimentAnalysis();

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

  const handleToggleResponseForm = () => {
    setShowResponseForm(!showResponseForm);
  };

  const handleResponseSuccess = () => {
    setShowResponseForm(false);
    onRefresh();
  };

  const handleResponseCancel = () => {
    setShowResponseForm(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <ReviewDetailsHeader
            review={review}
            onAIAnalysis={handleAIAnalysis}
            onToggleResponseForm={handleToggleResponseForm}
            onStatusUpdate={onStatusUpdate}
            showResponseForm={showResponseForm}
            isAnalyzing={sentimentAnalysis.isPending}
          />
        </DialogHeader>

        <div className="space-y-6">
          {/* Admin Response Form */}
          {showResponseForm && (
            <AdminResponseForm
              reviewId={review.id}
              onSuccess={handleResponseSuccess}
              onCancel={handleResponseCancel}
            />
          )}

          <ReviewDetailsContent review={review} />
          <ReviewRatingsDisplay review={review} />
          <ReviewStatsDisplay review={review} />
          <ReviewResponsesList responses={responses} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
