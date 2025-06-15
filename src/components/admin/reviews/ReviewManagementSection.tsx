
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminReviewsTable } from './AdminReviewsTable';
import { ReviewFilterBar } from './ReviewFilterBar';
import type { Tables } from '@/integrations/supabase/types';
import type { ReviewFilters, ReviewSort } from '@/pages/admin/AdminReviews';

type ReviewWithDetails = Tables<'reviews'> & {
  profiles: Tables<'profiles'> | null;
  events: Pick<Tables<'events'>, 'id' | 'title'> | null;
};

interface ReviewManagementSectionProps {
  reviews: ReviewWithDetails[];
  filters: ReviewFilters;
  onFiltersChange: (filters: ReviewFilters) => void;
  sort: ReviewSort;
  onSortChange: (sort: ReviewSort) => void;
  onRefresh: () => void;
  onReviewSelect: (review: ReviewWithDetails) => void;
}

export const ReviewManagementSection = ({
  reviews,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  onRefresh,
  onReviewSelect,
}: ReviewManagementSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ReviewFilterBar
          filters={filters}
          onFiltersChange={onFiltersChange}
          sort={sort}
          onSortChange={onSortChange}
        />

        <AdminReviewsTable
          reviews={reviews}
          onRefresh={onRefresh}
          onReviewSelect={onReviewSelect}
        />
      </CardContent>
    </Card>
  );
};
