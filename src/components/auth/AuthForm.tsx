
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const AuthForm = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You've been signed in successfully.",
      });
      navigate('/', { replace: true });
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signUp(email, password, fullName);
    
    if (error) {
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-[#4a6fdc]/20 to-[#7e8ef7]/20"></div>
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(74, 111, 220, 0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        ></div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-20 h-20 bg-gradient-to-br from-[#7e8ef7] to-[#4a6fdc] rounded-full opacity-20 animate-float"></div>
      <div className="absolute bottom-20 right-20 w-16 h-16 bg-gradient-to-br from-[#22c55e] to-[#16a34a] rounded-full opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 right-10 w-12 h-12 bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-full opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="card-elegant p-8 shadow-elegant hover:shadow-elegant-hover transition-all duration-500">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#4a6fdc] to-[#7e8ef7] rounded-xl flex items-center justify-center">
                <Sparkles className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">VibeCatcher</h1>
                <div className="h-1 w-16 bg-gradient-to-r from-[#4a6fdc] to-[#7e8ef7] rounded-full mx-auto mt-1"></div>
              </div>
            </div>
            <p className="text-[#64748b] leading-relaxed">
              Discover and review amazing events in your area
            </p>
          </div>
          
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#f1f5f9] p-1 rounded-xl">
              <TabsTrigger 
                value="signin" 
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-300 font-medium"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-300 font-medium"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="mt-6">
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-sm font-semibold text-[#202939]">Email</Label>
                  <input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/90 border-2 border-[#cbd5e1]/50 rounded-xl focus:border-[#4a6fdc] focus:bg-white focus:ring-4 focus:ring-[#4a6fdc]/10 transition-all duration-300 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-sm font-semibold text-[#202939]">Password</Label>
                  <input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/90 border-2 border-[#cbd5e1]/50 rounded-xl focus:border-[#4a6fdc] focus:bg-white focus:ring-4 focus:ring-[#4a6fdc]/10 transition-all duration-300 outline-none"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full btn-primary py-3 rounded-xl font-semibold text-lg shadow-elegant hover:shadow-elegant-hover transition-all duration-300" 
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignUp} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-sm font-semibold text-[#202939]">Full Name</Label>
                  <input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/90 border-2 border-[#cbd5e1]/50 rounded-xl focus:border-[#4a6fdc] focus:bg-white focus:ring-4 focus:ring-[#4a6fdc]/10 transition-all duration-300 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm font-semibold text-[#202939]">Email</Label>
                  <input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/90 border-2 border-[#cbd5e1]/50 rounded-xl focus:border-[#4a6fdc] focus:bg-white focus:ring-4 focus:ring-[#4a6fdc]/10 transition-all duration-300 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm font-semibold text-[#202939]">Password</Label>
                  <input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/90 border-2 border-[#cbd5e1]/50 rounded-xl focus:border-[#4a6fdc] focus:bg-white focus:ring-4 focus:ring-[#4a6fdc]/10 transition-all duration-300 outline-none"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full btn-primary py-3 rounded-xl font-semibold text-lg shadow-elegant hover:shadow-elegant-hover transition-all duration-300" 
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-[#64748b]">
              By continuing, you agree to our{' '}
              <a href="#" className="text-[#4a6fdc] hover:underline font-medium">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-[#4a6fdc] hover:underline font-medium">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
