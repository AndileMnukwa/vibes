
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, AlertTriangle, CheckCircle, XCircle, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type ReviewWithDetails = Tables<'reviews'> & {
  profiles: Tables<'profiles'> | null;
  events: Pick<Tables<'events'>, 'id' | 'title'> | null;
};

export const SuspiciousReviewsManager = () => {
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('flagged');

  // Fetch reviews flagged by AI
  const { data: flaggedReviews = [], isLoading, refetch } = useQuery({
    queryKey: ['flagged-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
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
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ReviewWithDetails[];
    },
  });

  // Fetch notifications about suspicious reviews - using 'system' type with alert_type filter
  const { data: suspiciousNotifications = [] } = useQuery({
    queryKey: ['suspicious-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('type', 'system')
        .eq('read', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter for suspicious review alerts
      return data.filter(notification => 
        notification.data && 
        typeof notification.data === 'object' && 
        'alert_type' in notification.data && 
        notification.data.alert_type === 'suspicious_review'
      );
    },
  });

  const updateReviewStatus = useMutation({
    mutationFn: async ({ reviewId, status }: { reviewId: string; status: 'approved' | 'rejected' }) => {
      const { error } = await supabase
        .from('reviews')
        .update({ status })
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['flagged-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast({
        title: 'Review status updated',
        description: `Review has been ${status}.`,
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating review',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const markNotificationAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suspicious-notifications'] });
    },
  });

  const ReviewCard = ({ review }: { review: ReviewWithDetails }) => {
    const authorName = review.profiles?.full_name || review.profiles?.username || 'Anonymous';
    const eventTitle = review.events?.title || 'Unknown Event';

    return (
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{review.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">by {authorName}</span>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">{eventTitle}</span>
                <Badge variant="outline" className="ml-2">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Flagged by AI
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">{review.content}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateReviewStatus.mutate({ reviewId: review.id, status: 'approved' })}
                disabled={updateReviewStatus.isPending}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateReviewStatus.mutate({ reviewId: review.id, status: 'rejected' })}
                disabled={updateReviewStatus.isPending}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(review.created_at).toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const NotificationCard = ({ notification }: { notification: any }) => {
    const data = notification.data || {};
    const flags = data.flags || [];
    const suspicionScore = data.suspicion_score || 0;

    return (
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium">{notification.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
              
              {flags.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-orange-700 mb-2">
                    Suspicion Score: {Math.round(suspicionScore * 100)}%
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {flags.map((flag: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {flag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => markNotificationAsRead.mutate(notification.id)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {new Date(notification.created_at).toLocaleString()}
          </p>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center">Loading suspicious reviews...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Fake Review Detection System
          </CardTitle>
          <Alert>
            <AlertDescription>
              Our AI system automatically analyzes reviews for suspicious patterns including duplicate content,
              generic language, rapid posting, and other indicators of fake reviews.
            </AlertDescription>
          </Alert>
        </CardHeader>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="flagged">
            Flagged Reviews ({flaggedReviews.length})
          </TabsTrigger>
          <TabsTrigger value="notifications">
            AI Alerts ({suspiciousNotifications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flagged" className="space-y-4">
          {flaggedReviews.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No flagged reviews at the moment. The AI system is actively monitoring new submissions.
                </p>
              </CardContent>
            </Card>
          ) : (
            flaggedReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))
          )}
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          {suspiciousNotifications.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No new AI alerts. All suspicious activity notifications have been reviewed.
                </p>
              </CardContent>
            </Card>
          ) : (
            suspiciousNotifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
