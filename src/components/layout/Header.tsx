
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
import { User, LogOut, Settings, Calendar, Home, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="glass-strong border-b border-border/50 sticky top-0 z-50 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="relative">
            <div className="w-10 h-10 coral-gradient rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
              <Sparkles className="text-white h-5 w-5" />
            </div>
            <div className="absolute inset-0 coral-gradient rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gradient">
              VibeCatcher
            </span>
            <span className="text-xs text-muted-foreground -mt-1">
              Discover Events
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-foreground/80 hover:text-primary transition-colors duration-200 font-medium group"
          >
            <Home className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span>Home</span>
          </Link>
          <Link 
            to="/calendar" 
            className="flex items-center space-x-2 text-foreground/80 hover:text-primary transition-colors duration-200 font-medium group"
          >
            <Calendar className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span>Calendar</span>
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all">
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="coral-gradient text-white font-semibold">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 glass-strong" align="end">
                <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer hover:bg-primary/10">
                  <User className="mr-3 h-4 w-4 text-primary" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/calendar')} className="cursor-pointer hover:bg-primary/10">
                  <Calendar className="mr-3 h-4 w-4 text-primary" />
                  Calendar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer hover:bg-destructive/10 text-destructive">
                  <LogOut className="mr-3 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              onClick={() => navigate('/auth')}
              className="primary-button"
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
