
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Download, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useUserAnalyticsData } from '@/hooks/useUserAnalyticsData';
import { toast } from 'sonner';

export const AnalyticsHeader = () => {
  const [dateRange, setDateRange] = useState('30d');
  const [isExporting, setIsExporting] = useState(false);
  const { metrics, timelineData, categoryData, reviewData } = useUserAnalyticsData();

  const dateRanges = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' },
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportData = {
        metrics,
        timelineData,
        categoryData,
        reviewData,
        exportDate: new Date().toISOString(),
        dateRange
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `vibecatcher-analytics-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Analytics data exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export analytics data');
    } finally {
      setIsExporting(false);
    }
  };

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
          
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export'}
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
