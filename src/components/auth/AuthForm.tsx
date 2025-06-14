
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Mail, Lock, User, ArrowRight } from 'lucide-react';

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
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back! 🎉",
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
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account created! ✨",
        description: "Please check your email to verify your account.",
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      
      {/* Floating Elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

      <Card className="w-full max-w-md glass border border-white/20 shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl blur opacity-20 animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-white">
              VibeCatcher
            </CardTitle>
            <CardDescription className="text-white/80 text-base">
              Discover and review amazing events in your area
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/10 rounded-xl p-1">
              <TabsTrigger 
                value="signin" 
                className="rounded-lg text-white data-[state=active]:bg-white data-[state=active]:text-purple-600 font-medium transition-all duration-200"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="rounded-lg text-white data-[state=active]:bg-white data-[state=active]:text-purple-600 font-medium transition-all duration-200"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-6 mt-8">
              <form onSubmit={handleSignIn} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-white/90 font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-xl py-3 focus:bg-white/20 focus:border-white/40 transition-all duration-200"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-white/90 font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-xl py-3 focus:bg-white/20 focus:border-white/40 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-white text-purple-600 hover:bg-white/90 font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {loading ? 'Signing In...' : 'Sign In'}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-6 mt-8">
              <form onSubmit={handleSignUp} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-white/90 font-medium">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-xl py-3 focus:bg-white/20 focus:border-white/40 transition-all duration-200"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-white/90 font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-xl py-3 focus:bg-white/20 focus:border-white/40 transition-all duration-200"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-white/90 font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-xl py-3 focus:bg-white/20 focus:border-white/40 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-white text-purple-600 hover:bg-white/90 font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {loading ? 'Creating Account...' : 'Create Account'}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="text-center">
            <p className="text-white/60 text-sm">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthForm;
