
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
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const EventDetail = () => {
  const navigate = useNavigate();
  const { event, isLoading, error } = useEventDetail();

  if (isLoading) {
    return (
      <Layout>
        <div className="container-modern content-padding">
          <div className="space-y-6">
            <Skeleton className="h-10 w-40 rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-80 w-full rounded-2xl" />
                <Skeleton className="h-40 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <Skeleton className="h-48 w-full rounded-2xl" />
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
        <div className="container-modern content-padding">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-red-500" />
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-slate-900">Event Not Found</h1>
              <p className="text-lg text-slate-600 max-w-md mx-auto">
                The event you're looking for doesn't exist or has been removed.
              </p>
            </div>
            <Button 
              onClick={() => navigate('/')}
              className="btn-gradient font-medium px-6 py-3 rounded-xl hover:scale-105 transition-all duration-200"
            >
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
      <div className="container-modern content-padding">
        <div className="space-y-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="group hover:bg-white/50 rounded-xl transition-all duration-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Back to Events</span>
          </Button>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Hero Section */}
              <div className="card-elevated p-0 overflow-hidden">
                <EventDetailHero event={event} />
              </div>

              <Separator className="my-8" />

              {/* Event Information */}
              <div className="card-elevated">
                <EventDetailInfo event={event} />
              </div>

              {/* Reviews Section */}
              <div className="card-elevated">
                <div className="p-6 border-b border-border/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Reviews & Ratings</h2>
                  </div>
                </div>
                <div className="p-6">
                  <ReviewsList eventId={event.id} />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <EventDetailSidebar event={event} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EventDetail;
