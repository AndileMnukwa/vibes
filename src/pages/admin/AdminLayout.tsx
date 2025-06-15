
import React, { useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Plus, Home, Bell, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationBell } from '@/components/admin/NotificationBell';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const navItems = [
    { path: '/admin/events', label: 'Manage Events', icon: Calendar },
    { path: '/admin/create-event', label: 'Create Event', icon: Plus },
    { path: '/admin/reviews', label: 'Manage Reviews', icon: MessageSquare },
    { path: '/admin/users', label: 'Manage Users', icon: Users },
    { path: '/admin/notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-purple-600">VibeCatcher Admin</h1>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationBell />
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>Back to App</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        <aside className="w-64 min-h-screen border-r bg-muted/10">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  location.pathname === item.path && "bg-purple-600 hover:bg-purple-700"
                )}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
