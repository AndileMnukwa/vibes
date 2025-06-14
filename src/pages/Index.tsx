
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import Layout from '@/components/layout/Layout';
import SearchBar from '@/components/search/SearchBar';
import CategoriesGrid from '@/components/categories/CategoriesGrid';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles, Star, Users, Calendar } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="text-center animate-fade-in">
          <div className="relative mx-auto mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#4a6fdc] to-[#7e8ef7] rounded-2xl flex items-center justify-center animate-pulse">
              <Sparkles className="text-white h-8 w-8" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-[#7e8ef7] to-[#4a6fdc] rounded-full animate-bounce"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gradient-to-r from-[#4a6fdc] to-[#7e8ef7] rounded-full w-32 mx-auto animate-pulse"></div>
            <div className="h-3 bg-[#cbd5e1] rounded-full w-24 mx-auto animate-pulse delay-75"></div>
          </div>
          <p className="mt-4 text-[#64748b] font-medium">Loading your experience...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-16">
        {/* Enhanced Hero Section */}
        <section className="text-center space-y-8 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#4a6fdc]/20 to-[#7e8ef7]/20 blur-3xl rounded-full transform scale-150"></div>
            <div className="relative space-y-6">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-[#f59e0b] fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
                <span className="text-[#64748b] font-medium">Rated #1 Event Discovery Platform</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-gradient leading-tight">
                Discover Amazing
                <br />
                <span className="text-gradient-secondary">Events</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-[#64748b] max-w-3xl mx-auto leading-relaxed">
                Find, review, and share the best events in your area from multiple sources.
                <br />
                <span className="text-[#4a6fdc] font-semibold">Join thousands of event enthusiasts today!</span>
              </p>

              <div className="flex items-center justify-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#4a6fdc]">10K+</div>
                  <div className="text-sm text-[#64748b]">Events Listed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#22c55e]">5K+</div>
                  <div className="text-sm text-[#64748b]">Happy Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#7e8ef7]">50+</div>
                  <div className="text-sm text-[#64748b]">Cities Covered</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Search Bar */}
          <div className="max-w-4xl mx-auto">
            <SearchBar />
          </div>
          
          {/* Admin Create Event Button */}
          {isAdmin && (
            <div className="flex justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/admin/create-event')}
                className="btn-primary px-8 py-4 rounded-2xl font-semibold text-lg shadow-elegant hover:shadow-elegant-hover transition-all duration-300 group"
              >
                <Plus className="mr-3 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                Create Event
                <Sparkles className="ml-3 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              </Button>
            </div>
          )}
        </section>

        {/* Enhanced Stats Section */}
        <section className="grid md:grid-cols-3 gap-8 animate-slide-up">
          <div className="card-elegant p-8 text-center group hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-[#4a6fdc] to-[#7e8ef7] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform duration-300">
              <Calendar className="text-white h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-[#202939] mb-2">Curated Events</h3>
            <p className="text-[#64748b]">Hand-picked events from trusted sources across your city</p>
          </div>
          
          <div className="card-elegant p-8 text-center group hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-[#22c55e] to-[#16a34a] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform duration-300">
              <Users className="text-white h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-[#202939] mb-2">Community Driven</h3>
            <p className="text-[#64748b]">Real reviews and ratings from fellow event-goers</p>
          </div>
          
          <div className="card-elegant p-8 text-center group hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-[#7e8ef7] to-[#6366f1] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform duration-300">
              <Sparkles className="text-white h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-[#202939] mb-2">Smart Recommendations</h3>
            <p className="text-[#64748b]">AI-powered suggestions based on your preferences</p>
          </div>
        </section>

        {/* Personalized Recommendations Section */}
        <section className="animate-slide-up">
          <RecommendationsSection limit={6} />
        </section>

        {/* Enhanced Events Section */}
        <section id="events-section" className="animate-slide-up">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
            <div>
              <h2 className="text-3xl font-bold text-gradient mb-2">All Events</h2>
              <p className="text-[#64748b] text-lg">Discover what's happening around you</p>
            </div>
            <Button 
              variant="outline" 
              className="border-2 border-[#4a6fdc] text-[#4a6fdc] hover:bg-[#4a6fdc] hover:text-white rounded-xl px-6 py-3 font-semibold transition-all duration-300 hover:scale-105"
            >
              View All Events
            </Button>
          </div>
          
          <EnhancedEventsGrid />
        </section>

        {/* Enhanced Categories Section */}
        <section id="categories-section" className="animate-slide-up">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gradient mb-4">Browse by Category</h2>
            <p className="text-[#64748b] text-lg max-w-2xl mx-auto">
              Find exactly what you're looking for with our organized categories
            </p>
          </div>
          <CategoriesGrid />
        </section>
      </div>
    </Layout>
  );
};

export default Index;
