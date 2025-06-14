
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
import { User, LogOut, Calendar, Home, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="glass sticky top-0 z-50 border-b border-white/20">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-[#4a6fdc] to-[#7e8ef7] rounded-xl flex items-center justify-center shadow-elegant group-hover:shadow-elegant-hover transition-all duration-300 group-hover:scale-105">
              <Sparkles className="text-white h-5 w-5" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-[#7e8ef7] to-[#4a6fdc] rounded-full animate-pulse"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gradient">
              VibeCatcher
            </span>
            <span className="text-xs text-[#64748b] font-medium">
              Discover Amazing Events
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            to="/" 
            className="group flex items-center space-x-2 text-[#64748b] hover:text-[#4a6fdc] transition-all duration-300 font-medium"
          >
            <Home className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
            <span className="relative">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#4a6fdc] to-[#7e8ef7] group-hover:w-full transition-all duration-300"></span>
            </span>
          </Link>
          <Link 
            to="/calendar" 
            className="group flex items-center space-x-2 text-[#64748b] hover:text-[#4a6fdc] transition-all duration-300 font-medium"
          >
            <Calendar className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
            <span className="relative">
              Calendar
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#4a6fdc] to-[#7e8ef7] group-hover:w-full transition-all duration-300"></span>
            </span>
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-white/10 transition-all duration-300">
                  <Avatar className="h-10 w-10 ring-2 ring-white/20 hover:ring-[#4a6fdc]/50 transition-all duration-300">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-[#4a6fdc] to-[#7e8ef7] text-white font-semibold">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#22c55e] border-2 border-white rounded-full"></div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-2 glass border-white/20" align="end">
                <div className="px-3 py-2 border-b border-white/10">
                  <p className="text-sm font-medium text-[#202939]">
                    {user.user_metadata?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-[#64748b]">{user.email}</p>
                </div>
                <DropdownMenuItem 
                  onClick={() => navigate('/profile')}
                  className="hover:bg-[#4a6fdc]/10 transition-colors duration-200"
                >
                  <User className="mr-2 h-4 w-4 text-[#4a6fdc]" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => navigate('/calendar')}
                  className="hover:bg-[#4a6fdc]/10 transition-colors duration-200"
                >
                  <Calendar className="mr-2 h-4 w-4 text-[#4a6fdc]" />
                  Calendar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="hover:bg-[#ef4444]/10 transition-colors duration-200 text-[#ef4444]"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              onClick={() => navigate('/auth')}
              className="btn-primary px-6 py-2 rounded-xl font-semibold shadow-elegant hover:shadow-elegant-hover transition-all duration-300"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
