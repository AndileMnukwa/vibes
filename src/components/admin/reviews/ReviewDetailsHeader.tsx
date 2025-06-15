
import React from 'react';
import { Button } from '@/components/ui/button';
import { DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Brain, MessageSquare } from 'lucide-react';
import { ReviewStatusBadge } from './ReviewStatusBadge';
import type { Tables } from '@/integrations/supabase/types';

type ReviewWithDetails = Tables<'reviews'> & {
  profiles: Tables<'profiles'> | null;
  events: Pick<Tables<'events'>, 'id' | 'title'> | null;
};

interface ReviewDetailsHeaderProps {
  review: ReviewWithDetails;
  onAIAnalysis: () => void;
  onToggleResponseForm: () => void;
  onStatusUpdate: (reviewId: string, status: 'approved' | 'rejected') => void;
  showResponseForm: boolean;
  isAnalyzing: boolean;
}

export const ReviewDetailsHeader = ({
  review,
  onAIAnalysis,
  onToggleResponseForm,
  onStatusUpdate,
  showResponseForm,
  isAnalyzing,
}: ReviewDetailsHeaderProps) => {
  return (
    <DialogTitle className="flex items-center justify-between">
      <span>Review Details</span>
      <div className="flex items-center gap-2">
        <ReviewStatusBadge status={review.status} />
        <Button
          variant="outline"
          size="sm"
          onClick={onAIAnalysis}
          disabled={isAnalyzing}
          className="text-purple-600 border-purple-600 hover:bg-purple-50"
        >
          <Brain className="h-4 w-4 mr-1" />
          {isAnalyzing ? 'Analyzing...' : 'AI Analysis'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleResponseForm}
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
  );
};
