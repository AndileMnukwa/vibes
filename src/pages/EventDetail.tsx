
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
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gradient-to-r from-[#cbd5e1] to-[#e2e8f0] rounded-xl w-32"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gradient-to-r from-[#cbd5e1] to-[#e2e8f0] rounded-2xl"></div>
                <div className="h-32 bg-gradient-to-r from-[#cbd5e1] to-[#e2e8f0] rounded-xl"></div>
              </div>
              <div className="space-y-4">
                <div className="h-48 bg-gradient-to-r from-[#cbd5e1] to-[#e2e8f0] rounded-xl"></div>
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
        <div className="container mx-auto px-4 py-8">
          <div className="text-center card-elegant p-12 max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-[#ef4444] to-[#dc2626] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-3xl">😕</span>
            </div>
            <h1 className="text-2xl font-bold text-[#202939] mb-4">Event Not Found</h1>
            <p className="text-[#64748b] mb-6 leading-relaxed">
              The event you're looking for doesn't exist or has been removed.
            </p>
            <Button 
              onClick={() => navigate('/')}
              className="btn-primary px-6 py-3 rounded-xl font-semibold"
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
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 hover:bg-white/10 rounded-xl px-4 py-2 transition-all duration-300 group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium">Back to Events</span>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <div className="card-elegant p-0 overflow-hidden">
              <EventDetailHero event={event} />
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-[#cbd5e1] to-transparent"></div>

            {/* Event Information */}
            <div className="card-elegant">
              <EventDetailInfo event={event} />
            </div>

            {/* Reviews Section */}
            <div className="card-elegant p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-lg flex items-center justify-center">
                  <Star className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#202939]">Reviews & Ratings</h2>
              </div>
              <ReviewsList eventId={event.id} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card-elegant">
              <EventDetailSidebar event={event} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EventDetail;
