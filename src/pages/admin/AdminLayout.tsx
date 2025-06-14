
import React, { useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Plus, Home, Settings, BarChart3, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const AdminLayout = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (!roleLoading && !isAdmin) {
      navigate('/');
    }
  }, [user, isAdmin, authLoading, roleLoading, navigate]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-purple-100 animate-pulse opacity-20"></div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-slate-700">Loading Admin Panel</p>
            <p className="text-sm text-slate-500">Preparing your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const navItems = [
    { path: '/admin/events', label: 'Manage Events', icon: Calendar, description: 'View and manage all events' },
    { path: '/admin/create-event', label: 'Create Event', icon: Plus, description: 'Add new events' },
    { path: '/admin/users', label: 'Manage Users', icon: Users, description: 'User management' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="glass border-b border-white/20 sticky top-0 z-40">
        <div className="container-modern">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl blur opacity-25"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">VibeCatcher Admin</h1>
                <p className="text-sm text-slate-600">Administrative Dashboard</p>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="hover-lift rounded-xl font-medium border-white/20 bg-white/50 hover:bg-white/70"
            >
              <Home className="h-4 w-4 mr-2" />
              <span>Back to App</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-5rem)]">
        {/* Sidebar */}
        <aside className="w-80 glass border-r border-white/20 p-6">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-auto p-4 rounded-xl transition-all duration-200",
                  location.pathname === item.path 
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-xl" 
                    : "hover:bg-white/50 text-slate-700 hover:text-slate-900"
                )}
                onClick={() => navigate(item.path)}
              >
                <div className="flex items-center space-x-3 w-full">
                  <div className={cn(
                    "p-2 rounded-lg transition-colors duration-200",
                    location.pathname === item.path 
                      ? "bg-white/20" 
                      : "bg-slate-100"
                  )}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className={cn(
                      "text-xs opacity-70",
                      location.pathname === item.path ? "text-white/70" : "text-slate-500"
                    )}>
                      {item.description}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </nav>

          {/* Admin Stats */}
          <div className="mt-8 p-4 bg-white/30 rounded-xl border border-white/20">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Quick Stats
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Events</span>
                <span className="font-medium">1,234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Active Users</span>
                <span className="font-medium">5,678</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">This Month</span>
                <span className="font-medium text-green-600">+12%</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
