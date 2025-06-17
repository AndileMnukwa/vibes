
import { useMutation } from '@tanstack/react-query';
import { FakeReviewDetectionService } from '@/services/fakeReviewDetectionService';
import type { Tables } from '@/integrations/supabase/types';

type Review = Tables<'reviews'> & {
  profiles: Tables<'profiles'> | null;
};

interface UseReviewDetectionParams {
  onDetectionComplete?: (isSuspicious: boolean, flags: string[]) => void;
}

export function useFakeReviewDetection({ onDetectionComplete }: UseReviewDetectionParams = {}) {
  const detectFakeReview = useMutation({
    mutationFn: async (review: Review) => {
      console.log('Analyzing review for suspicious patterns...');
      const detectionResult = await FakeReviewDetectionService.analyzeReview(review);
      
      if (detectionResult.isSuspicious) {
        console.log('Suspicious review detected:', {
          score: detectionResult.suspicionScore,
          flags: detectionResult.flags
        });
        
        // Flag the review and notify admins
        await FakeReviewDetectionService.flagSuspiciousReview(review.id, detectionResult);
      }
      
      return detectionResult;
    },
    onSuccess: (result) => {
      onDetectionComplete?.(result.isSuspicious, result.flags);
    },
    onError: (error) => {
      console.error('Error in fake review detection:', error);
    },
  });

  return {
    detectFakeReview: detectFakeReview.mutate,
    isAnalyzing: detectFakeReview.isPending,
    detectionResult: detectFakeReview.data,
    error: detectFakeReview.error,
  };
}
