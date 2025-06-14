
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { RecommendationService } from '@/services/recommendationService';

export function usePersonalizedRecommendations(limit: number = 6) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['personalized-recommendations', user?.id, limit],
    queryFn: () => {
      if (!user?.id) {
        return RecommendationService.getPopularEvents(limit);
      }
      return RecommendationService.getPersonalizedRecommendations(user.id, limit);
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePopularEvents(limit: number = 6) {
  return useQuery({
    queryKey: ['popular-events', limit],
    queryFn: () => RecommendationService.getPopularEvents(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useSimilarEvents(eventId: string, limit: number = 4) {
  return useQuery({
    queryKey: ['similar-events', eventId, limit],
    queryFn: () => RecommendationService.getSimilarEvents(eventId, limit),
    enabled: !!eventId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}
