
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import Layout from '@/components/layout/Layout';
import SearchBar from '@/components/search/SearchBar';
import CategoriesGrid from '@/components/categories/CategoriesGrid';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles, TrendingUp, Calendar, Users } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center hero-section">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 coral-gradient rounded-2xl mx-auto mb-4 animate-pulse flex items-center justify-center">
            <Sparkles className="text-white h-8 w-8" />
          </div>
          <p className="text-lg text-foreground/80 font-medium">Loading your experience...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-section relative py-20 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/30">
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-white text-sm font-medium">Discover Amazing Events</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Find Your Next
              <span className="block text-gradient bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Adventure
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-white/90 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              Discover, review, and share the most exciting events from multiple sources in one beautiful place
            </p>
            
            {/* Enhanced Search Bar */}
            <div className="mb-8 animate-slide-up">
              <SearchBar />
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
              {isAdmin && (
                <Button 
                  size="lg" 
                  className="primary-button text-lg px-8 py-4 h-auto"
                  onClick={() => navigate('/admin/create-event')}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Create Event
                </Button>
              )}
              <Button 
                size="lg" 
                variant="outline"
                className="outline-button text-lg px-8 py-4 h-auto bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-primary"
                onClick={() => document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <TrendingUp className="mr-2 h-5 w-5" />
                Explore Events
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-10 w-20 h-20 coral-gradient rounded-full opacity-20 animate-float"></div>
        <div className="absolute bottom-1/4 right-10 w-16 h-16 coral-gradient rounded-full opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 coral-gradient rounded-full opacity-10 animate-float" style={{ animationDelay: '4s' }}></div>
      </section>

      <div className="container mx-auto px-4 py-16 space-y-24">
        {/* Stats Section */}
        <section className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="feature-card text-center">
              <div className="w-12 h-12 coral-gradient rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Curated Events</h3>
              <p className="text-muted-foreground">Hand-picked events from trusted sources</p>
            </div>
            <div className="feature-card text-center">
              <div className="w-12 h-12 coral-gradient rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
              <p className="text-muted-foreground">Reviews and ratings from real attendees</p>
            </div>
            <div className="feature-card text-center">
              <div className="w-12 h-12 coral-gradient rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalized</h3>
              <p className="text-muted-foreground">AI-powered recommendations just for you</p>
            </div>
          </div>
        </section>

        {/* Personalized Recommendations Section */}
        <section className="animate-fade-in">
          <RecommendationsSection limit={6} />
        </section>

        {/* Events Section */}
        <section id="events-section" className="animate-fade-in">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gradient mb-2">All Events</h2>
              <p className="text-muted-foreground text-lg">Discover events from multiple sources</p>
            </div>
            <Button variant="outline" className="outline-button">
              View All
            </Button>
          </div>
          
          <EnhancedEventsGrid />
        </section>

        {/* Categories Section */}
        <section id="categories-section" className="animate-fade-in">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gradient mb-4">Browse by Category</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Find events that match your interests and discover new experiences
            </p>
          </div>
          <CategoriesGrid />
        </section>
      </div>
    </Layout>
  );
};

export default Index;
