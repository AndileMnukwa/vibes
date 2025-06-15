
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, CheckCircle, XCircle, Brain } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type ReviewWithDetails = Tables<'reviews'> & {
  profiles: Tables<'profiles'> | null;
  events: Pick<Tables<'events'>, 'id' | 'title'> | null;
};

interface ReviewTableActionsProps {
  review: ReviewWithDetails;
  onReviewClick: (review: ReviewWithDetails) => void;
  onAIAnalysis: (review: ReviewWithDetails) => void;
  onStatusUpdate: (reviewId: string, status: 'approved' | 'rejected') => void;
  isAnalyzing: boolean;
  isUpdatingStatus: boolean;
}

export const ReviewTableActions = ({
  review,
  onReviewClick,
  onAIAnalysis,
  onStatusUpdate,
  isAnalyzing,
  isUpdatingStatus,
}: ReviewTableActionsProps) => {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onReviewClick(review)}
        title="View Details"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onAIAnalysis(review)}
        disabled={isAnalyzing}
        title="Analyze with AI"
      >
        <Brain className="h-4 w-4 text-purple-600" />
      </Button>
      {review.status === 'pending' && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onStatusUpdate(review.id, 'approved')}
            disabled={isUpdatingStatus}
            title="Approve"
          >
            <CheckCircle className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onStatusUpdate(review.id, 'rejected')}
            disabled={isUpdatingStatus}
            title="Reject"
          >
            <XCircle className="h-4 w-4 text-red-600" />
          </Button>
        </>
      )}
    </div>
  );
};
