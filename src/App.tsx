
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { SearchProvider } from '@/contexts/SearchContext';
import { LocationProvider } from '@/components/location/LocationProvider';
import { EnhancedApp } from '@/components/enhanced/EnhancedApp';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Calendar from '@/pages/Calendar';
import Profile from '@/pages/Profile';
import EventDetail from '@/pages/EventDetail';
import PaymentSuccess from '@/pages/PaymentSuccess';
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminEvents from '@/pages/admin/AdminEvents';
import AdminCreateEvent from '@/pages/admin/AdminCreateEvent';
import AdminEditEvent from '@/pages/admin/AdminEditEvent';
import AdminEventRegistrations from '@/pages/admin/AdminEventRegistrations';
import AdminReviews from '@/pages/admin/AdminReviews';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminNotifications from '@/pages/admin/AdminNotifications';
import NotFound from '@/pages/NotFound';
import UserNotifications from '@/pages/UserNotifications';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SearchProvider>
          <LocationProvider>
            <BrowserRouter>
              <EnhancedApp>
                <div className="min-h-screen bg-background">
                  <Toaster />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/notifications" element={<UserNotifications />} />
                    <Route path="/events/:id" element={<EventDetail />} />
                    <Route path="/payment-success" element={<PaymentSuccess />} />
                    
                    {/* Admin routes */}
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route path="events" element={<AdminEvents />} />
                      <Route path="create-event" element={<AdminCreateEvent />} />
                      <Route path="edit-event/:id" element={<AdminEditEvent />} />
                      <Route path="events/:eventId/registrations" element={<AdminEventRegistrations />} />
                      <Route path="reviews" element={<AdminReviews />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="notifications" element={<AdminNotifications />} />
                    </Route>
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </EnhancedApp>
            </BrowserRouter>
          </LocationProvider>
        </SearchProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
