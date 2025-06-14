
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import Layout from '@/components/layout/Layout';
import SearchBar from '@/components/search/SearchBar';
import CategoriesGrid from '@/components/categories/CategoriesGrid';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles, Calendar, Users, Star } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-purple-100 animate-pulse opacity-20"></div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-slate-700">Loading VibeCatcher</p>
            <p className="text-sm text-slate-500">Preparing your event discovery experience...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <Layout>
      <div className="relative">
        {/* Hero Section */}
        <section className="relative overflow-hidden section-padding bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
          
          <div className="container-modern relative">
            <div className="text-center max-w-4xl mx-auto space-y-8">
              {/* Hero Content */}
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-center">
                  <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white/90 text-sm font-medium">
                    <Sparkles className="w-4 h-4" />
                    <span>Discover • Connect • Experience</span>
                  </div>
                </div>
                
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white text-balance leading-tight">
                  Discover Amazing
                  <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                    Events
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto text-balance leading-relaxed">
                  Find, review, and share the most exciting events in your area. 
                  Connect with your community and create unforgettable experiences.
                </p>
              </div>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto animate-slide-up">
                <SearchBar />
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
                {isAdmin && (
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/admin/create-event')}
                    className="bg-white text-purple-600 hover:bg-white/90 font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Create Event
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="lg"
                  className="btn-glass font-semibold px-8 py-4 rounded-xl"
                  onClick={() => navigate('/calendar')}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  View Calendar
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 max-w-md mx-auto mt-12 animate-slide-up">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white">1000+</div>
                  <div className="text-sm text-white/70">Events</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white">50K+</div>
                  <div className="text-sm text-white/70">Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white">4.9</div>
                  <div className="text-sm text-white/70">Rating</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Sections */}
        <div className="container-modern content-padding space-y-16">
          {/* Personalized Recommendations */}
          <section className="animate-fade-in">
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 rounded-full px-4 py-2 text-sm font-medium mb-4">
                <Star className="w-4 h-4" />
                <span>Personalized for You</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Recommended Events
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Discover events tailored to your interests and location
              </p>
            </div>
            <RecommendationsSection limit={6} />
          </section>

          {/* All Events Section */}
          <section id="events-section" className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                  All Events
                </h2>
                <p className="text-lg text-slate-600">
                  Browse through all available events and find your next adventure
                </p>
              </div>
              <Button variant="outline" className="hover-lift rounded-xl font-medium">
                View All Events
              </Button>
            </div>
            
            <EnhancedEventsGrid />
          </section>

          {/* Categories Section */}
          <section id="categories-section" className="animate-fade-in">
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 rounded-full px-4 py-2 text-sm font-medium mb-4">
                <Users className="w-4 h-4" />
                <span>Explore Categories</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Browse by Category
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Find events that match your interests and hobbies
              </p>
            </div>
            <CategoriesGrid />
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
