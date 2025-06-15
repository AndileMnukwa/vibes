
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { AdminReviewsHeader } from '@/components/admin/reviews/AdminReviewsHeader';
import { ReviewStatsCards } from '@/components/admin/reviews/ReviewStatsCards';
import { ReviewManagementSection } from '@/components/admin/reviews/ReviewManagementSection';
import { ReviewDetailsModal } from '@/components/admin/reviews/ReviewDetailsModal';
import { Skeleton } from '@/components/ui/skeleton';
import { useReviewStats } from '@/hooks/useReviewStats';
import { useReviewModal } from '@/hooks/useReviewModal';
import type { Tables } from '@/integrations/supabase/types';

type ReviewWithDetails = Tables<'reviews'> & {
  profiles: Tables<'profiles'> | null;
  events: Pick<Tables<'events'>, 'id' | 'title'> | null;
};

export interface ReviewFilters {
  status: string;
  rating: string;
  sentiment: string;
  eventId: string;
  search: string;
}

export interface ReviewSort {
  field: 'created_at' | 'rating' | 'helpful_count';
  direction: 'asc' | 'desc';
}

const AdminReviews = () => {
  const [filters, setFilters] = useState<ReviewFilters>({
    status: 'all',
    rating: 'all',
    sentiment: 'all',
    eventId: 'all',
    search: '',
  });

  const [sort, setSort] = useState<ReviewSort>({
    field: 'created_at',
    direction: 'desc',
  });

  const { data: reviews = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-reviews', filters, sort],
    queryFn: async () => {
      let query = supabase
        .from('reviews')
        .select(`
          *,
          profiles (
            id,
            full_name,
            username,
            avatar_url
          ),
          events (
            id,
            title
          )
        `);

      // Apply filters
      if (filters.status !== 'all') {
        const validStatus = filters.status as 'pending' | 'approved' | 'rejected';
        query = query.eq('status', validStatus);
      }

      if (filters.rating !== 'all') {
        query = query.eq('rating', parseInt(filters.rating));
      }

      if (filters.sentiment !== 'all') {
        query = query.eq('sentiment', filters.sentiment);
      }

      if (filters.eventId !== 'all') {
        query = query.eq('event_id', filters.eventId);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }

      // Apply sorting
      query = query.order(sort.field, { ascending: sort.direction === 'asc' });

      const { data, error } = await query;
      if (error) throw error;
      return data as ReviewWithDetails[];
    },
  });

  const stats = useReviewStats(reviews);
  const { selectedReview, setSelectedReview, closeModal } = useReviewModal(reviews);

  const handleStatusUpdate = (reviewId: string, status: 'approved' | 'rejected') => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-16" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-destructive">
            Failed to load reviews. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <AdminReviewsHeader />
      <ReviewStatsCards stats={stats} />
      <ReviewManagementSection
        reviews={reviews}
        filters={filters}
        onFiltersChange={setFilters}
        sort={sort}
        onSortChange={setSort}
        onRefresh={refetch}
        onReviewSelect={setSelectedReview}
      />

      {selectedReview && (
        <ReviewDetailsModal
          review={selectedReview}
          isOpen={!!selectedReview}
          onClose={closeModal}
          onStatusUpdate={handleStatusUpdate}
          onRefresh={refetch}
        />
      )}
    </div>
  );
};

export default AdminReviews;
