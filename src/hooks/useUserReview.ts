
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UseUserReviewProps {
  eventId: string;
}

export const useUserReview = ({ eventId }: UseUserReviewProps) => {
  const { user } = useAuth();

  const { data: userReview, isLoading, error } = useQuery({
    queryKey: ['user-review', eventId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!eventId,
  });

  return {
    userReview,
    hasReviewed: !!userReview,
    isLoading,
    error,
  };
};
