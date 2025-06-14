
-- Add sentiment analysis columns to reviews table
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
ADD COLUMN IF NOT EXISTS sentiment_confidence DECIMAL(3,2) CHECK (sentiment_confidence >= 0 AND sentiment_confidence <= 1),
ADD COLUMN IF NOT EXISTS ai_summary TEXT;

-- Create index for sentiment queries
CREATE INDEX IF NOT EXISTS idx_reviews_sentiment ON public.reviews(sentiment);
