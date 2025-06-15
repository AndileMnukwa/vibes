
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { ReviewTableHeader } from './ReviewTableHeader';
import { ReviewTableRow } from './ReviewTableRow';
import { useSentimentAnalysis } from '@/hooks/useSentimentAnalysis';
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
  const sentimentAnalysis = useSentimentAnalysis();

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

  const handleAIAnalysis = async (review: ReviewWithDetails) => {
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
        <ReviewTableHeader />
        <TableBody>
          {reviews.map((review) => (
            <ReviewTableRow
              key={review.id}
              review={review}
              onReviewClick={handleReviewClick}
              onAIAnalysis={handleAIAnalysis}
              onStatusUpdate={handleStatusUpdate}
              isAnalyzing={sentimentAnalysis.isPending}
              isUpdatingStatus={updateReviewStatus.isPending}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
