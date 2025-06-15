
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminReviewsTable } from '@/components/admin/reviews/AdminReviewsTable';
import { ReviewFilterBar } from '@/components/admin/reviews/ReviewFilterBar';
import { ReviewStatsCards } from '@/components/admin/reviews/ReviewStatsCards';
import { Skeleton } from '@/components/ui/skeleton';
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
        query = query.eq('status', filters.status);
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

  const filteredStats = useMemo(() => {
    return {
      total: reviews.length,
      pending: reviews.filter(r => r.status === 'pending').length,
      approved: reviews.filter(r => r.status === 'approved').length,
      rejected: reviews.filter(r => r.status === 'rejected').length,
      averageRating: reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0,
    };
  }, [reviews]);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Reviews</h1>
          <p className="text-muted-foreground">
            Review and moderate user submissions
          </p>
        </div>
      </div>

      <ReviewStatsCards stats={filteredStats} />

      <Card>
        <CardHeader>
          <CardTitle>Review Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ReviewFilterBar
            filters={filters}
            onFiltersChange={setFilters}
            sort={sort}
            onSortChange={setSort}
          />

          <AdminReviewsTable
            reviews={reviews}
            onRefresh={refetch}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReviews;
