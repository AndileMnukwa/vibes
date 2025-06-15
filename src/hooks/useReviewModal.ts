
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Tables } from '@/integrations/supabase/types';

type ReviewWithDetails = Tables<'reviews'> & {
  profiles: Tables<'profiles'> | null;
  events: Pick<Tables<'events'>, 'id' | 'title'> | null;
};

export const useReviewModal = (reviews: ReviewWithDetails[]) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedReview, setSelectedReview] = useState<ReviewWithDetails | null>(null);
  const reviewIdParam = searchParams.get('reviewId');

  // Handle reviewId URL parameter - automatically open the review details modal
  useEffect(() => {
    if (reviewIdParam && reviews.length > 0) {
      const targetReview = reviews.find(review => review.id === reviewIdParam);
      if (targetReview) {
        setSelectedReview(targetReview);
        // Remove the reviewId parameter from URL after opening the modal
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('reviewId');
        setSearchParams(newSearchParams, { replace: true });
      }
    }
  }, [reviewIdParam, reviews, searchParams, setSearchParams]);

  const closeModal = () => setSelectedReview(null);

  return {
    selectedReview,
    setSelectedReview,
    closeModal,
  };
};
