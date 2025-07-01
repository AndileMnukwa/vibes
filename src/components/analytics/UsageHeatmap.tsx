
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserAnalyticsData } from '@/hooks/useUserAnalyticsData';
import { Clock } from 'lucide-react';

export const UsageHeatmap = () => {
  const { heatmapData, loading } = useUserAnalyticsData();

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getIntensity = (day: number, hour: number) => {
    if (!heatmapData) return 0;
    const data = heatmapData.find(d => d.day === day && d.hour === hour);
    return data ? data.intensity : 0;
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return 'bg-muted/20';
    if (intensity < 0.3) return 'bg-blue-200';
    if (intensity < 0.6) return 'bg-blue-400';
    if (intensity < 0.8) return 'bg-blue-600';
    return 'bg-blue-800';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Usage Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted/20 rounded-lg animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
            <Clock className="h-4 w-4 text-white" />
          </div>
          Usage Patterns
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex gap-1 text-xs text-muted-foreground mb-2">
            <div className="w-8"></div>
            {hours.filter((_, i) => i % 4 === 0).map(hour => (
              <div key={hour} className="w-4 text-center">{hour}</div>
            ))}
          </div>
          
          {days.map((day, dayIndex) => (
            <div key={day} className="flex items-center gap-1">
              <div className="w-8 text-xs text-muted-foreground">{day}</div>
              <div className="flex gap-1">
                {hours.map(hour => (
                  <div
                    key={hour}
                    className={`w-3 h-3 rounded-sm ${getIntensityColor(getIntensity(dayIndex, hour))}`}
                    title={`${day} ${hour}:00 - Activity: ${(getIntensity(dayIndex, hour) * 100).toFixed(0)}%`}
                  />
                ))}
              </div>
            </div>
          ))}
          
          <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
            <span>Less activity</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-muted/20"></div>
              <div className="w-3 h-3 rounded-sm bg-blue-200"></div>
              <div className="w-3 h-3 rounded-sm bg-blue-400"></div>
              <div className="w-3 h-3 rounded-sm bg-blue-600"></div>
              <div className="w-3 h-3 rounded-sm bg-blue-800"></div>
            </div>
            <span>More activity</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
