
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Calendar, LogOut, User, Bell, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LocationSelector } from '@/components/location/LocationSelector';

const Header = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
          <Calendar className="h-8 w-8 text-purple-600" />
          <h1 className="text-2xl font-bold text-purple-600">VibeCatcher</h1>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <button
            onClick={() => handleNavigation('/')}
            className={`transition-colors ${
              isActive('/') 
                ? 'text-purple-600 font-medium' 
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            Events
          </button>
          <button
            onClick={() => {
              const reviewsSection = document.getElementById('reviews-section');
              if (reviewsSection) {
                reviewsSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="text-gray-600 hover:text-purple-600 transition-colors"
          >
            Reviews
          </button>
          <button
            onClick={() => {
              const categoriesSection = document.getElementById('categories-section');
              if (categoriesSection) {
                categoriesSection.scrollIntoView({ behavior: 'smooth' });
              } else {
                navigate('/');
                setTimeout(() => {
                  const section = document.getElementById('categories-section');
                  if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                  }
                }, 100);
              }
            }}
            className="text-gray-600 hover:text-purple-600 transition-colors"
          >
            Categories
          </button>
        </nav>

        <div className="flex items-center space-x-4">
          <LocationSelector />
          <ThemeToggle />
          {user ? (
            <>
              {/* Admin Create Event Button */}
              {isAdmin && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-purple-600 hover:text-purple-700"
                  onClick={() => navigate('/admin/create-event')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              )}
              
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/admin/events')}>
                        <Plus className="mr-2 h-4 w-4" />
                        <span>Admin Panel</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
