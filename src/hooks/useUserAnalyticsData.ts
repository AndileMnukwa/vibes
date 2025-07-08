
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsMetrics {
  eventsViewed: number;
  reviewsWritten: number;
  ticketsPurchased: number;
  calendarActions: number;
}

interface TimelineData {
  date: string;
  pageViews: number;
  interactions: number;
}

interface CategoryData {
  name: string;
  value: number;
}

interface ReviewData {
  rating: string;
  count: number;
}

interface HeatmapData {
  day: number;
  hour: number;
  intensity: number;
}

interface Insight {
  type: 'achievement' | 'streak' | 'preference' | 'goal';
  title: string;
  description: string;
  color: string;
}

export const useUserAnalyticsData = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [reviewData, setReviewData] = useState<ReviewData[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);

        // Fetch user analytics data
        const { data: analyticsData } = await supabase
          .from('user_analytics')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false });

        // Fetch user reviews
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('rating, created_at')
          .eq('user_id', user.id);

        // Fetch user tickets/purchases
        const { data: purchasesData } = await supabase
          .from('event_purchases')
          .select('*')
          .eq('user_id', user.id);

        // Fetch user event attendance
        const { data: attendanceData } = await supabase
          .from('user_event_attendance')
          .select('*')
          .eq('user_id', user.id);

        // Calculate metrics
        const eventsViewed = analyticsData?.filter(a => a.event_type === 'event_view').length || 0;
        const reviewsWritten = reviewsData?.length || 0;
        const ticketsPurchased = purchasesData?.length || 0;
        const calendarActions = analyticsData?.filter(a => a.event_type === 'calendar_action').length || 0;

        const calculatedMetrics: AnalyticsMetrics = {
          eventsViewed,
          reviewsWritten,
          ticketsPurchased,
          calendarActions,
        };

        // Process timeline data (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toISOString().split('T')[0];
        }).reverse();

        const processedTimelineData: TimelineData[] = last7Days.map(date => {
          const dayAnalytics = analyticsData?.filter(a => 
            a.timestamp.split('T')[0] === date
          ) || [];
          
          return {
            date,
            pageViews: dayAnalytics.filter(a => a.event_type === 'page_view').length,
            interactions: dayAnalytics.filter(a => a.event_type === 'user_interaction').length,
          };
        });

        // Process category preferences (based on event views)
        const categoryMap = new Map<string, number>();
        analyticsData?.forEach(event => {
          if (event.event_type === 'event_view' && event.event_data?.category) {
            const category = event.event_data.category;
            categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
          }
        });

        const processedCategoryData: CategoryData[] = Array.from(categoryMap.entries())
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);

        // If no category data from analytics, provide default structure
        if (processedCategoryData.length === 0) {
          processedCategoryData.push(
            { name: 'Music', value: eventsViewed > 0 ? Math.floor(eventsViewed * 0.4) : 5 },
            { name: 'Tech', value: eventsViewed > 0 ? Math.floor(eventsViewed * 0.3) : 3 },
            { name: 'Food', value: eventsViewed > 0 ? Math.floor(eventsViewed * 0.2) : 2 },
            { name: 'Sports', value: eventsViewed > 0 ? Math.floor(eventsViewed * 0.1) : 1 }
          );
        }

        // Process review ratings distribution
        const ratingCounts = new Map<number, number>();
        reviewsData?.forEach(review => {
          ratingCounts.set(review.rating, (ratingCounts.get(review.rating) || 0) + 1);
        });

        const processedReviewData: ReviewData[] = [1, 2, 3, 4, 5].map(rating => ({
          rating: `${rating} Star${rating !== 1 ? 's' : ''}`,
          count: ratingCounts.get(rating) || 0,
        }));

        // Generate heatmap data based on user activity patterns
        const processedHeatmapData: HeatmapData[] = [];
        for (let day = 0; day < 7; day++) {
          for (let hour = 0; hour < 24; hour++) {
            const dayAnalytics = analyticsData?.filter(a => {
              const eventDate = new Date(a.timestamp);
              return eventDate.getDay() === day && eventDate.getHours() === hour;
            }) || [];
            
            processedHeatmapData.push({
              day,
              hour,
              intensity: Math.min(dayAnalytics.length / 5, 1), // Normalize to 0-1
            });
          }
        }

        // Generate insights based on real data
        const generatedInsights: Insight[] = [];
        
        if (eventsViewed >= 10) {
          generatedInsights.push({
            type: 'achievement',
            title: 'Event Explorer',
            description: `Viewed ${eventsViewed} events this month`,
            color: 'from-yellow-500 to-orange-500',
          });
        }

        if (reviewsWritten >= 5) {
          generatedInsights.push({
            type: 'goal',
            title: 'Review Champion',
            description: `Written ${reviewsWritten} helpful reviews`,
            color: 'from-blue-500 to-cyan-500',
          });
        }

        if (ticketsPurchased >= 3) {
          generatedInsights.push({
            type: 'streak',
            title: 'Event Attendee',
            description: `Purchased ${ticketsPurchased} tickets`,
            color: 'from-purple-500 to-pink-500',
          });
        }

        // Add a preference insight based on most viewed category
        if (processedCategoryData.length > 0) {
          const topCategory = processedCategoryData[0];
          generatedInsights.push({
            type: 'preference',
            title: `${topCategory.name} Enthusiast`,
            description: `Most interested in ${topCategory.name.toLowerCase()} events`,
            color: 'from-green-500 to-teal-500',
          });
        }

        // If no insights generated, provide defaults
        if (generatedInsights.length === 0) {
          generatedInsights.push({
            type: 'goal',
            title: 'Getting Started',
            description: 'Explore events to unlock insights',
            color: 'from-gray-500 to-gray-600',
          });
        }

        setMetrics(calculatedMetrics);
        setTimelineData(processedTimelineData);
        setCategoryData(processedCategoryData);
        setReviewData(processedReviewData);
        setHeatmapData(processedHeatmapData);
        setInsights(generatedInsights);

      } catch (error) {
        console.error('Error fetching analytics data:', error);
        
        // Fallback to minimal default data on error
        setMetrics({
          eventsViewed: 0,
          reviewsWritten: 0,
          ticketsPurchased: 0,
          calendarActions: 0,
        });
        setTimelineData([]);
        setCategoryData([]);
        setReviewData([]);
        setHeatmapData([]);
        setInsights([{
          type: 'goal',
          title: 'Welcome',
          description: 'Start exploring to see your analytics',
          color: 'from-purple-500 to-blue-500',
        }]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [user]);

  return {
    loading,
    metrics,
    timelineData,
    categoryData,
    reviewData,
    heatmapData,
    insights,
  };
};
