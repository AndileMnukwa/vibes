
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SearchProvider } from "@/contexts/SearchContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import EventDetail from "./pages/EventDetail";
import Profile from "./pages/Profile";
import Calendar from "./pages/Calendar";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminCreateEvent from "./pages/admin/AdminCreateEvent";
import AdminEditEvent from "./pages/admin/AdminEditEvent";
import AdminUsers from "./pages/admin/AdminUsers";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { LocationProvider } from "@/components/location/LocationProvider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vibe-catcher-theme">
      <AuthProvider>
        <LocationProvider>
          <SearchProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/events/:id" element={<EventDetail />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route path="events" element={<AdminEvents />} />
                    <Route path="create-event" element={<AdminCreateEvent />} />
                    <Route path="edit-event/:id" element={<AdminEditEvent />} />
                    <Route path="users" element={<AdminUsers />} />
                  </Route>
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </SearchProvider>
        </LocationProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
