import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import Layout from '@/components/layout/Layout';
import SearchBar from '@/components/search/SearchBar';
import { Button } from '@/components/ui/button';
import { Plus, MapPin } from 'lucide-react';
import { EnhancedEventsGrid } from '@/components/events/EnhancedEventsGrid';
import { motion } from 'framer-motion';
import { useLocation } from '@/components/location/LocationProvider';

const Index = () => {
  const { user, loading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { userLocation, requestLocation, locationLoading } = useLocation();

  if (loading || (user && roleLoading)) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-lg text-muted-foreground">Loading your personalized experience...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* New Hero Section */}
        <motion.div
          className="text-center mb-16 py-16 px-8 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 dark:from-purple-800 dark:to-blue-800 text-white relative overflow-hidden shadow-2xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-black/30 z-0"></div>
          <div className="relative z-10">
            <motion.h1 
              className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Discover Your Next Experience
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl text-white/80 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Explore thousands of local and global events. Your one-stop platform for finding, reviewing, and sharing amazing experiences.
            </motion.p>
            
            <motion.div 
              className="mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <SearchBar />
            </motion.div>

            {!userLocation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="space-y-2"
              >
                <Button size="lg" onClick={requestLocation} disabled={locationLoading} className="bg-white text-purple-700 hover:bg-white/90 font-semibold shadow-lg transform hover:scale-105 transition-transform duration-200">
                  <MapPin className="mr-2 h-5 w-5 animate-pulse" />
                  {locationLoading ? 'Finding You...' : 'Find Events Near Me'}
                </Button>
                <p className="text-sm text-white/60">or set your location in the header</p>
              </motion.div>
            )}
            
            {isAdmin && (
              <div className="absolute top-4 right-4 z-20">
                <Button 
                  size="sm" 
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                  onClick={() => navigate('/admin/create-event')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Events Section */}
        <section id="events-section">
          <EnhancedEventsGrid />
        </section>

      </div>
    </Layout>
  );
};

export default Index;
