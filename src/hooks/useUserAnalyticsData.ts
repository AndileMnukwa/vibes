
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

        // Mock data for demonstration - replace with real queries
        const mockMetrics: AnalyticsMetrics = {
          eventsViewed: 47,
          reviewsWritten: 12,
          ticketsPurchased: 8,
          calendarActions: 23,
        };

        const mockTimelineData: TimelineData[] = [
          { date: '2024-06-20', pageViews: 15, interactions: 8 },
          { date: '2024-06-21', pageViews: 22, interactions: 12 },
          { date: '2024-06-22', pageViews: 18, interactions: 9 },
          { date: '2024-06-23', pageViews: 31, interactions: 18 },
          { date: '2024-06-24', pageViews: 25, interactions: 15 },
          { date: '2024-06-25', pageViews: 28, interactions: 16 },
          { date: '2024-06-26', pageViews: 33, interactions: 21 },
        ];

        const mockCategoryData: CategoryData[] = [
          { name: 'Music', value: 35 },
          { name: 'Tech', value: 28 },
          { name: 'Food', value: 20 },
          { name: 'Sports', value: 17 },
        ];

        const mockReviewData: ReviewData[] = [
          { rating: '1 Star', count: 1 },
          { rating: '2 Stars', count: 2 },
          { rating: '3 Stars', count: 3 },
          { rating: '4 Stars', count: 8 },
          { rating: '5 Stars', count: 12 },
        ];

        const mockHeatmapData: HeatmapData[] = [];
        for (let day = 0; day < 7; day++) {
          for (let hour = 0; hour < 24; hour++) {
            mockHeatmapData.push({
              day,
              hour,
              intensity: Math.random(),
            });
          }
        }

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        setMetrics(mockMetrics);
        setTimelineData(mockTimelineData);
        setCategoryData(mockCategoryData);
        setReviewData(mockReviewData);
        setHeatmapData(mockHeatmapData);

        // In a real implementation, you would fetch actual data like this:
        /*
        const { data: analyticsData } = await supabase
          .from('user_analytics')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false });
        */

      } catch (error) {
        console.error('Error fetching analytics data:', error);
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
