
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AnalyzeSentimentParams {
  reviewId: string;
  title: string;
  content: string;
}

interface SentimentAnalysisResult {
  success: boolean;
  sentiment?: 'positive' | 'negative' | 'neutral';
  confidence?: number;
  summary?: string;
  error?: string;
}

export function useSentimentAnalysis() {
  return useMutation({
    mutationFn: async (params: AnalyzeSentimentParams): Promise<SentimentAnalysisResult> => {
      const { data, error } = await supabase.functions.invoke('analyze-review-sentiment', {
        body: params,
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
  });
}
