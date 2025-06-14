
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Star, Smile, Frown, Meh } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Review = Tables<'reviews'>;

interface ReviewStatsProps {
  reviews: Review[];
}

export const ReviewStats = ({ reviews }: ReviewStatsProps) => {
  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No reviews yet</p>
            <p className="text-sm text-muted-foreground">Be the first to review this event!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate statistics
  const totalReviews = reviews.length;
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

  // Rating distribution
  const ratingCounts = [5, 4, 3, 2, 1].map(rating => 
    reviews.filter(review => review.rating === rating).length
  );

  // Sentiment distribution
  const sentimentCounts = {
    positive: reviews.filter(r => r.sentiment === 'positive').length,
    negative: reviews.filter(r => r.sentiment === 'negative').length,
    neutral: reviews.filter(r => r.sentiment === 'neutral').length,
  };

  // Detailed ratings averages
  const atmosphereReviews = reviews.filter(r => r.atmosphere_rating);
  const organizationReviews = reviews.filter(r => r.organization_rating);
  const valueReviews = reviews.filter(r => r.value_rating);

  const averageAtmosphere = atmosphereReviews.length > 0
    ? atmosphereReviews.reduce((sum, r) => sum + (r.atmosphere_rating || 0), 0) / atmosphereReviews.length
    : 0;

  const averageOrganization = organizationReviews.length > 0
    ? organizationReviews.reduce((sum, r) => sum + (r.organization_rating || 0), 0) / organizationReviews.length
    : 0;

  const averageValue = valueReviews.length > 0
    ? valueReviews.reduce((sum, r) => sum + (r.value_rating || 0), 0) / valueReviews.length
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          Reviews & Ratings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((rating, index) => (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm w-3">{rating}</span>
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <Progress 
                  value={(ratingCounts[index] / totalReviews) * 100} 
                  className="flex-1 h-2"
                />
                <span className="text-sm text-muted-foreground w-8">
                  {ratingCounts[index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment Analysis */}
        {(sentimentCounts.positive > 0 || sentimentCounts.negative > 0 || sentimentCounts.neutral > 0) && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-medium flex items-center gap-2">
              <Smile className="h-4 w-4" />
              Sentiment Analysis
            </h4>
            <div className="space-y-2">
              {sentimentCounts.positive > 0 && (
                <div className="flex items-center gap-2">
                  <Smile className="h-4 w-4 text-green-600" />
                  <span className="text-sm w-16">Positive</span>
                  <Progress 
                    value={(sentimentCounts.positive / totalReviews) * 100} 
                    className="flex-1 h-2"
                  />
                  <span className="text-sm text-muted-foreground w-8">
                    {sentimentCounts.positive}
                  </span>
                </div>
              )}
              {sentimentCounts.neutral > 0 && (
                <div className="flex items-center gap-2">
                  <Meh className="h-4 w-4 text-gray-600" />
                  <span className="text-sm w-16">Neutral</span>
                  <Progress 
                    value={(sentimentCounts.neutral / totalReviews) * 100} 
                    className="flex-1 h-2"
                  />
                  <span className="text-sm text-muted-foreground w-8">
                    {sentimentCounts.neutral}
                  </span>
                </div>
              )}
              {sentimentCounts.negative > 0 && (
                <div className="flex items-center gap-2">
                  <Frown className="h-4 w-4 text-red-600" />
                  <span className="text-sm w-16">Negative</span>
                  <Progress 
                    value={(sentimentCounts.negative / totalReviews) * 100} 
                    className="flex-1 h-2"
                  />
                  <span className="text-sm text-muted-foreground w-8">
                    {sentimentCounts.negative}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Detailed Ratings */}
        {(averageAtmosphere > 0 || averageOrganization > 0 || averageValue > 0) && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-medium">Detailed Ratings</h4>
            {averageAtmosphere > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Atmosphere</span>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${
                          star <= Math.round(averageAtmosphere)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {averageAtmosphere.toFixed(1)}
                  </span>
                </div>
              </div>
            )}
            {averageOrganization > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Organization</span>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${
                          star <= Math.round(averageOrganization)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {averageOrganization.toFixed(1)}
                  </span>
                </div>
              </div>
            )}
            {averageValue > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Value</span>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${
                          star <= Math.round(averageValue)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {averageValue.toFixed(1)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
