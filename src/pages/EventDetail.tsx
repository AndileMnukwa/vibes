
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
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const EventDetail = () => {
  const navigate = useNavigate();
  const { event, isLoading, error } = useEventDetail();

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !event) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The event you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/')}>
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
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <EventDetailHero event={event} />

            <Separator />

            {/* Event Information */}
            <EventDetailInfo event={event} />

            {/* Reviews Section */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Reviews & Ratings</h2>
              <ReviewsList eventId={event.id} />
            </div>
          </div>

          {/* Sidebar */}
          <EventDetailSidebar event={event} />
        </div>
      </div>
    </Layout>
  );
};

export default EventDetail;
