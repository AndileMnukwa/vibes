
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Smile, Frown, Meh } from 'lucide-react';

interface SentimentIndicatorProps {
  sentiment: 'positive' | 'negative' | 'neutral' | null;
  confidence?: number | null;
  size?: 'sm' | 'md' | 'lg';
}

export const SentimentIndicator = ({ 
  sentiment, 
  confidence, 
  size = 'sm' 
}: SentimentIndicatorProps) => {
  if (!sentiment) return null;

  const getSentimentConfig = () => {
    switch (sentiment) {
      case 'positive':
        return {
          icon: Smile,
          color: 'bg-green-100 text-green-800 border-green-200',
          label: 'Positive',
        };
      case 'negative':
        return {
          icon: Frown,
          color: 'bg-red-100 text-red-800 border-red-200',
          label: 'Negative',
        };
      case 'neutral':
        return {
          icon: Meh,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          label: 'Neutral',
        };
      default:
        return null;
    }
  };

  const config = getSentimentConfig();
  if (!config) return null;

  const { icon: Icon, color, label } = config;
  const iconSize = size === 'lg' ? 'h-5 w-5' : size === 'md' ? 'h-4 w-4' : 'h-3 w-3';

  return (
    <Badge 
      variant="outline" 
      className={`${color} gap-1 text-xs`}
      title={confidence ? `Confidence: ${Math.round(confidence * 100)}%` : undefined}
    >
      <Icon className={iconSize} />
      {label}
    </Badge>
  );
};
