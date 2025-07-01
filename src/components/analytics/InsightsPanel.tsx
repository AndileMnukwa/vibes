
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Zap, Heart } from 'lucide-react';
import { useUserAnalyticsData } from '@/hooks/useUserAnalyticsData';

export const InsightsPanel = () => {
  const { insights, loading } = useUserAnalyticsData();

  const insightIcons = {
    achievement: Trophy,
    streak: Zap,
    preference: Heart,
    goal: Target,
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-muted/50 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const defaultInsights = [
    {
      type: 'achievement' as const,
      title: 'Event Explorer',
      description: 'Viewed 25+ events this month',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      type: 'streak' as const,
      title: '7-Day Streak',
      description: 'Active for 7 consecutive days',
      color: 'from-purple-500 to-pink-500',
    },
    {
      type: 'preference' as const,
      title: 'Music Lover',
      description: 'Most interested in music events',
      color: 'from-green-500 to-teal-500',
    },
    {
      type: 'goal' as const,
      title: 'Review Champion',
      description: 'Written 5 helpful reviews',
      color: 'from-blue-500 to-cyan-500',
    },
  ];

  const displayInsights = insights || defaultInsights;

  return (
    <Card className="glass border-0 bg-gradient-to-r from-background to-muted/30">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <Zap className="h-3 w-3 text-white" />
          </div>
          <h3 className="text-lg font-semibold">Smart Insights</h3>
          <Badge variant="secondary">AI Powered</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayInsights.map((insight, index) => {
            const Icon = insightIcons[insight.type];
            
            return (
              <div
                key={index}
                className="relative p-4 rounded-xl bg-background/50 border border-border/50 hover:shadow-md transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${insight.color} opacity-5 rounded-xl`}></div>
                <div className="relative">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${insight.color} flex items-center justify-center mb-3`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
