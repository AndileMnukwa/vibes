
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { AnalyticsHeader } from '@/components/analytics/AnalyticsHeader';
import { AnalyticsMetricsCards } from '@/components/analytics/AnalyticsMetricsCards';
import { ActivityTimelineChart } from '@/components/analytics/ActivityTimelineChart';
import { CategoryPreferencesChart } from '@/components/analytics/CategoryPreferencesChart';
import { ReviewAnalyticsChart } from '@/components/analytics/ReviewAnalyticsChart';
import { UsageHeatmap } from '@/components/analytics/UsageHeatmap';
import { InsightsPanel } from '@/components/analytics/InsightsPanel';

const Analytics = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <AnalyticsHeader />
        
        <div className="space-y-8">
          {/* Key Metrics Overview */}
          <AnalyticsMetricsCards />
          
          {/* Insights Panel */}
          <InsightsPanel />
          
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActivityTimelineChart />
            <CategoryPreferencesChart />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ReviewAnalyticsChart />
            <UsageHeatmap />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
