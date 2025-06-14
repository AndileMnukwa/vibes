
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { usePersonalizedRecommendations } from '@/hooks/useRecommendations';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedEventCard } from '@/components/events/EnhancedEventCard';
import { Sparkles, TrendingUp } from 'lucide-react';

interface RecommendationsSectionProps {
  limit?: number;
}

export function RecommendationsSection({ limit = 6 }: RecommendationsSectionProps) {
  const { user } = useAuth();
  const { data: recommendations, isLoading, error } = usePersonalizedRecommendations(limit);

  if (error) {
    console.error('Error loading recommendations:', error);
    return null;
  }

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <Card key={i} className="h-64">
              <Skeleton className="h-full w-full" />
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const isPersonalized = !!user;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isPersonalized ? (
            <Sparkles className="h-6 w-6 text-purple-600" />
          ) : (
            <TrendingUp className="h-6 w-6 text-orange-600" />
          )}
          <div>
            <h2 className="text-2xl font-semibold">
              {isPersonalized ? 'Recommended for You' : 'Popular Events'}
            </h2>
            {isPersonalized && (
              <p className="text-sm text-muted-foreground">
                Based on your preferences and activity
              </p>
            )}
          </div>
        </div>
        
        {isPersonalized && (
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            <Sparkles className="h-3 w-3 mr-1" />
            Personalized
          </Badge>
        )}
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
      >
        {recommendations.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <EnhancedEventCard
              event={event}
              isExternal={false}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
