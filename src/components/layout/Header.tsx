import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings, Calendar, Home, Bell, TrendingUp } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { UserNotificationBell } from '@/components/notifications/UserNotificationBell';

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            VibeCatcher
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            to="/" 
            className="flex items-center space-x-1 text-gray-600 hover:text-purple-600 transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
          <Link 
            to="/calendar" 
            className="flex items-center space-x-1 text-gray-600 hover:text-purple-600 transition-colors"
          >
            <Calendar className="h-4 w-4" />
            <span>Calendar</span>
          </Link>
          {user && (
            <Link 
              to="/analytics" 
              className="flex items-center space-x-1 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Analytics</span>
            </Link>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          {user && <UserNotificationBell />}
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback>
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/analytics')}>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Analytics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/notifications')}>
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/calendar')}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Calendar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
