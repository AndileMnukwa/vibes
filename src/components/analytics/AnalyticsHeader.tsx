
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Download, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const AnalyticsHeader = () => {
  const [dateRange, setDateRange] = useState('30d');

  const dateRanges = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' },
  ];

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Your Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Discover insights about your VibeCatcher journey and engagement patterns
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1">
              {dateRanges.map((range) => (
                <Button
                  key={range.value}
                  variant={dateRange === range.value ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDateRange(range.value)}
                  className={dateRange === range.value ? 'bg-purple-600 hover:bg-purple-700' : ''}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>
          
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-2">
        <Badge variant="secondary" className="gap-1">
          <TrendingUp className="h-3 w-3" />
          Activity Insights
        </Badge>
        <span className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};
