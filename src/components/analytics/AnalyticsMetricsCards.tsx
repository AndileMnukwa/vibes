
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, MessageSquare, Ticket, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { useUserAnalyticsData } from '@/hooks/useUserAnalyticsData';

export const AnalyticsMetricsCards = () => {
  const { metrics, loading } = useUserAnalyticsData();

  const cards = [
    {
      title: 'Events Viewed',
      value: metrics?.eventsViewed || 0,
      change: '+12%',
      trend: 'up',
      icon: Eye,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Reviews Written',
      value: metrics?.reviewsWritten || 0,
      change: '+8%',
      trend: 'up',
      icon: MessageSquare,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Tickets Purchased',
      value: metrics?.ticketsPurchased || 0,
      change: '+25%',
      trend: 'up',
      icon: Ticket,
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Calendar Actions',
      value: metrics?.calendarActions || 0,
      change: '-2%',
      trend: 'down',
      icon: Calendar,
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const TrendIcon = card.trend === 'up' ? TrendingUp : TrendingDown;
        
        return (
          <Card key={index} className="relative overflow-hidden border-0 bg-gradient-to-br from-background to-muted/50 hover:shadow-lg transition-all duration-300">
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-5`}></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  card.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendIcon className="h-3 w-3" />
                  {card.change}
                </div>
              </div>
              
              <div>
                <div className="text-2xl font-bold mb-1">{card.value.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">{card.title}</div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
