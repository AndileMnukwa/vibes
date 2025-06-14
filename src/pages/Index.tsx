
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import Layout from '@/components/layout/Layout';
import EventsGrid from '@/components/events/EventsGrid';
import SearchBar from '@/components/search/SearchBar';
import CategoriesGrid from '@/components/categories/CategoriesGrid';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { EnhancedEventsGrid } from '@/components/events/EnhancedEventsGrid';
import { RecommendationsSection } from '@/components/recommendations/RecommendationsSection';

const Index = () => {
  const { user, loading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Discover Amazing Events
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Find, review, and share the best events in your area from multiple sources
          </p>
          
          {/* Search Bar */}
          <div className="mb-6">
            <SearchBar />
          </div>
          
          {/* Only show Create Event button for admins */}
          {isAdmin && (
            <Button 
              size="lg" 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => navigate('/admin/create-event')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          )}
        </div>

        {/* Personalized Recommendations Section */}
        <section className="mb-16">
          <RecommendationsSection limit={6} />
        </section>

        {/* Events Section */}
        <section id="events-section">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">All Events</h2>
            <Button variant="outline">View All</Button>
          </div>
          
          <EnhancedEventsGrid />
        </section>

        {/* Categories Section */}
        <section id="categories-section" className="mt-16">
          <h2 className="text-2xl font-semibold mb-6">Browse by Category</h2>
          <CategoriesGrid />
        </section>
      </div>
    </Layout>
  );
};

export default Index;
