
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import EventsGrid from '@/components/events/EventsGrid';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Amazing Events
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Find, review, and share the best events in your area
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search events, locations, or categories..."
                className="pl-10 pr-4 py-3 text-lg"
              />
            </div>
          </div>
          
          <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>

        {/* Events Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Upcoming Events</h2>
            <Button variant="outline">View All</Button>
          </div>
          
          <EventsGrid />
        </section>

        {/* Categories Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Music', color: '#8B5CF6', count: 12 },
              { name: 'Food & Drink', color: '#F59E0B', count: 8 },
              { name: 'Arts & Culture', color: '#EF4444', count: 5 },
              { name: 'Technology', color: '#3B82F6', count: 15 },
            ].map((category) => (
              <div
                key={category.name}
                className="p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                style={{ borderColor: category.color + '40' }}
              >
                <div
                  className="w-8 h-8 rounded-full mb-2"
                  style={{ backgroundColor: category.color }}
                />
                <h3 className="font-medium">{category.name}</h3>
                <p className="text-sm text-muted-foreground">{category.count} events</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
