
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { EventDetailHero } from '@/components/events/EventDetailHero';
import { EventDetailInfo } from '@/components/events/EventDetailInfo';
import { EventDetailSidebar } from '@/components/events/EventDetailSidebar';
import { ReviewsList } from '@/components/reviews/ReviewsList';
import { useEventDetail } from '@/hooks/useEventDetail';
import { ArrowLeft, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const EventDetail = () => {
  const navigate = useNavigate();
  const { event, isLoading, error } = useEventDetail();

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <Skeleton className="h-8 w-32" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="glass rounded-2xl overflow-hidden">
                  <Skeleton className="h-64 w-full" />
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
                <div className="glass rounded-2xl p-6">
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="glass rounded-2xl p-6">
                  <Skeleton className="h-48 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !event) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 coral-gradient rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <Star className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gradient mb-4">Event Not Found</h1>
            <p className="text-muted-foreground mb-8 text-lg">
              The event you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/')} className="primary-button">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 hover:bg-primary/10 rounded-xl group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Events
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <div className="glass rounded-2xl overflow-hidden card-hover">
              <EventDetailHero event={event} />
            </div>

            <Separator className="opacity-50" />

            {/* Event Information */}
            <div className="glass rounded-2xl overflow-hidden">
              <EventDetailInfo event={event} />
            </div>

            {/* Reviews Section */}
            <div className="glass rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 coral-gradient rounded-lg flex items-center justify-center">
                  <Star className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gradient">Reviews & Ratings</h2>
              </div>
              <ReviewsList eventId={event.id} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <EventDetailSidebar event={event} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EventDetail;
